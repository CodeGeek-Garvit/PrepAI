import express from 'express';
import { InterviewSession } from '../models.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { generateInterviewQuestions, generateCompanyInterviewQuestions, evaluateAnswer } from '../services/gemini.ts';

const router = express.Router();

router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { role, experienceLevel, techStack, resumeText } = req.body;
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

    const questions = await generateInterviewQuestions(role, experienceLevel, techStack, resumeText);

    const session = new InterviewSession({
      userId: req.userId,
      role,
      experienceLevel,
      techStack,
      questions: questions.map((q: any) => ({ category: q.category, text: q.text }))
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error generating interview' });
  }
});

router.post('/generate-company', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { company, role, experienceLevel, techStack } = req.body;
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!company) return res.status(400).json({ message: 'Company is required' });

    console.log(`[Route] Generating company-specific interview questions for ${company} (${role})`);
    const questions = await generateCompanyInterviewQuestions(company, role, experienceLevel, techStack);

    const session = new InterviewSession({
      userId: req.userId,
      role,
      experienceLevel,
      techStack,
      company,
      isCompanySpecific: true,
      questions: questions.map((q: any) => ({ category: q.category, text: q.text })),
      overallScore: 0
    });

    await session.save();
    res.status(201).json(session);
  } catch (error: any) {
    console.error(`[Route] generate-company error:`, error.message);
    res.status(500).json({ message: 'Error generating company interview' });
  }
});

router.post('/evaluate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId, questionId, questionText, answer } = req.body;
    
    const evaluation = await evaluateAnswer(questionText, answer);

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.feedback.push({
      questionId,
      answer,
      evaluation
    });

    // Compute overall score dynamically as average of confidence scores scaled to 0-100
    if (session.feedback.length > 0) {
      const sum = session.feedback.reduce((acc: number, f: any) => acc + (f.evaluation.confidenceScore || 7), 0);
      const avg = sum / session.feedback.length;
      session.overallScore = Math.min(100, Math.max(0, Math.round(avg * 10)));
    }

    await session.save();
    res.json({ evaluation, session });
  } catch (error) {
    res.status(500).json({ message: 'Error evaluating answer' });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const list = await InterviewSession.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
