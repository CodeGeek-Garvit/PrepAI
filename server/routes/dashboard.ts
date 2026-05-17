import express from 'express';
import mongoose from 'mongoose';
import { ResumeAnalysis, InterviewSession } from '../models.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const latestResume = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    const latestInterviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const resumeHistory = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const scoreTrend = await ResumeAnalysis.find({ userId })
      .sort({ createdAt: 1 })
      .select('atsScore createdAt')
      .limit(20);

    // Simple aggregate stats
    const averageAtsScore = await ResumeAnalysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: "$atsScore" } } }
    ]);

    const totalInterviews = await InterviewSession.countDocuments({ userId });
    const totalResumes = await ResumeAnalysis.countDocuments({ userId });

    res.json({
      latestResume,
      latestInterviews,
      resumeHistory,
      scoreTrend,
      stats: {
        avgAts: Math.round(averageAtsScore[0]?.avg || 0),
        totalInterviews,
        totalResumes
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router;
