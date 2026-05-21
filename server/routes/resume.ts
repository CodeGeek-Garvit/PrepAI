import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { ResumeAnalysis } from '../models.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { analyzeResume } from '../services/gemini.ts';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('resume'), async (req: any, res) => {
  console.log(`[Upload] Start - User: ${req.userId}, File: ${req.file?.originalname}`);
  console.log('PDF parser type:', typeof PDFParse);
  
  try {
    if (!req.file) {
      console.warn('[Upload] Failed - No file provided');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!req.userId) {
      console.warn('[Upload] Failed - Unauthorized');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Parse PDF using v2 API
    console.log('[Upload] Parsing PDF...');
    let resumeText = '';
    const parser = new PDFParse({ data: req.file.buffer });
    
    try {
      const data = await parser.getText();
      resumeText = data.text;
      console.log(`[Upload] PDF Parsed successfully (${resumeText.length} characters)`);
      if (resumeText.length < 50) {
        console.warn('[Upload] Warning: PDF text too short:', resumeText);
      }
    } catch (pdfError: any) {
      console.error('[Upload] PDF Parsing failed:', pdfError.message);
      return res.status(422).json({ 
        message: 'Could not read PDF content. Please ensure it is a valid PDF file.',
        details: pdfError.message 
      });
    } finally {
      await parser.destroy();
    }

    if (!resumeText || resumeText.trim().length === 0) {
      console.warn('[Upload] PDF contained no readable text');
      return res.status(422).json({ message: 'The uploaded PDF seems to be empty or contains no readable text.' });
    }

    // AI Analysis
    console.log('[Upload] Requesting Gemini AI Analysis...');
    let analysis;
    try {
      analysis = await analyzeResume(resumeText);
      if (analysis.isFallback) {
        console.warn(`[Upload] Gemini Analysis returned fallback data. Reason: ${analysis.fallbackReason}`);
      } else {
        console.log('[Upload] Gemini Analysis completed (Score: ' + analysis.atsScore + ')');
      }
    } catch (aiError: any) {
      console.error('[Upload] Gemini Analysis failed critically:', aiError.message);
      return res.status(503).json({
        message: 'AI Analysis service is temporarily unavailable.',
        details: aiError.message === 'GEMINI_API_KEY_MISSING' ? 'Server API Key is not configured.' : aiError.message
      });
    }

    // Save to DB
    console.log('[Upload] Saving analysis to MongoDB...');
    const newAnalysis = new ResumeAnalysis({
      userId: req.userId,
      filename: req.file.originalname,
      resumeText,
      atsScore: analysis.atsScore,
      isFallback: analysis.isFallback || false,
      fallbackReason: analysis.fallbackReason || null,
      analysis: {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingSkills: analysis.missingSkills || [],
        formattingRecommendations: analysis.formattingRecommendations || [],
        improvementSuggestions: analysis.improvementSuggestions || []
      }
    });

    try {
      await newAnalysis.save();
      console.log('[Upload] Success - Analysis saved. ID:', newAnalysis._id);
    } catch (dbError: any) {
      console.error('[Upload] Database save failed:', dbError.message);
      throw dbError;
    }

    res.status(201).json(newAnalysis);
  } catch (error: any) {
    console.error('[Upload] CRITICAL ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to process resume analysis', 
      details: error?.message || 'Unknown server error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const list = await ResumeAnalysis.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
