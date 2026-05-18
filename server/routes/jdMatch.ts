import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { JDMatch } from '../models.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { matchResumeWithJD } from '../services/gemini.ts';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', authMiddleware, upload.single('resume'), async (req: any, res) => {
  const { jobDescription } = req.body;
  const userId = req.userId;

  console.log(`[JD Match] Start - User: ${userId}, File: ${req.file?.originalname}`);

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ message: 'Please provide a detailed job description (minimum 50 characters).' });
    }

    // 1. Parse PDF
    console.log('[JD Match] Parsing PDF...');
    let resumeText = '';
    const parser = new PDFParse({ data: req.file.buffer });
    
    try {
      const data = await parser.getText();
      resumeText = data.text;
      console.log(`[JD Match] PDF Parsed successfully (${resumeText.length} characters)`);
    } catch (pdfError: any) {
      console.error('[JD Match] PDF Parsing failed:', pdfError.message);
      return res.status(422).json({ 
        message: 'Could not read PDF content. Please ensure it is a valid PDF file.',
        details: pdfError.message 
      });
    } finally {
      await parser.destroy();
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(422).json({ message: 'The uploaded PDF seems to be empty or contains no readable text.' });
    }

    // 2. AI Analysis
    console.log('[JD Match] Requesting Gemini AI Comparison...');
    let analysis;
    try {
      analysis = await matchResumeWithJD(resumeText, jobDescription);
      console.log('[JD Match] Comparison completed. Score:', analysis.matchScore);
    } catch (aiError: any) {
      console.error('[JD Match] Gemini Analysis failed critically:', aiError.message);
      return res.status(503).json({
        message: 'AI Comparison service is temporarily unavailable.',
        details: aiError.message === 'GEMINI_API_KEY_MISSING' ? 'Server API Key is not configured.' : aiError.message
      });
    }

    // 3. Save to DB
    const newMatch = new JDMatch({
      userId,
      uploadedResumeName: req.file.originalname,
      jobTitle: analysis.jobTitle || 'Unspecified Role',
      matchScore: analysis.matchScore,
      matchingSkills: analysis.matchingSkills || [],
      missingSkills: analysis.missingSkills || [],
      atsKeywords: analysis.atsKeywords || [],
      suggestions: analysis.suggestions || [],
      hiringProbability: analysis.hiringProbability || 'Medium',
    });

    await newMatch.save();
    console.log('[JD Match] Success - Saved with ID:', newMatch._id);

    res.status(201).json(newMatch);
  } catch (error: any) {
    console.error('[JD Match] CRITICAL ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to analyze resume match',
      details: error?.message || 'Unknown server error'
    });
  }
});

router.get('/history', authMiddleware, async (req: any, res) => {
  try {
    const history = await JDMatch.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
