import express from 'express';
import { InterviewSession } from '../models.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { generateInterviewQuestions, evaluateAnswer } from '../services/gemini.ts';

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
