import express from 'express';
import mongoose from 'mongoose';
import { ResumeAnalysis, InterviewSession, JDMatch } from '../models.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const latestResume = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    const latestInterviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(6);
    const resumeHistory = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const jdMatches = await JDMatch.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const scoreTrend = await ResumeAnalysis.find({ userId })
      .sort({ createdAt: 1 })
      .select('atsScore createdAt')
      .limit(20);

    const allInterviews = await InterviewSession.find({ userId }).sort({ createdAt: -1 });

    // Company Wise Progress Tracking and Stats
    const companyStatsMap: Record<string, { count: number; sumScore: number; completedCount: number }> = {};
    let totalQuestionsEvaluated = 0;
    let confidenceSum = 0;
    
    // Core categories stats mapping
    const categoryScores: Record<string, { sum: number; count: number }> = {
      'Technical': { sum: 0, count: 0 },
      'DSA': { sum: 0, count: 0 },
      'Behavioral': { sum: 0, count: 0 },
      'Situational': { sum: 0, count: 0 },
      'Leadership': { sum: 0, count: 0 },
      'HR': { sum: 0, count: 0 }
    };

    allInterviews.forEach((session: any) => {
      // If it has evaluated answers, count them
      if (session.feedback && session.feedback.length > 0) {
        session.feedback.forEach((fb: any) => {
          totalQuestionsEvaluated += 1;
          confidenceSum += (fb.evaluation?.confidenceScore || 0);

          // Category attribution
          const qText = fb.answer ? "answer" : "";
          if (qText) {
            // Find corresponding question to determine its category
            const questionObj = session.questions.find((q: any) => q._id?.toString() === fb.questionId || q.id === fb.questionId);
            const category = questionObj?.category || 'Technical';
            
            // Normalize category name
            let normalizedCat = 'Technical';
            if (category.toLowerCase().includes('dsa') || category.toLowerCase().includes('algo')) normalizedCat = 'DSA';
            else if (category.toLowerCase().includes('behavior')) normalizedCat = 'Behavioral';
            else if (category.toLowerCase().includes('situat')) normalizedCat = 'Situational';
            else if (category.toLowerCase().includes('leader')) normalizedCat = 'Leadership';
            else if (category.toLowerCase().includes('hr') || category.toLowerCase().includes('human')) normalizedCat = 'HR';

            if (!categoryScores[normalizedCat]) {
              categoryScores[normalizedCat] = { sum: 0, count: 0 };
            }
            categoryScores[normalizedCat].sum += (fb.evaluation?.confidenceScore || 7);
            categoryScores[normalizedCat].count += 1;
          }
        });
      }

      if (session.isCompanySpecific && session.company) {
        if (!companyStatsMap[session.company]) {
          companyStatsMap[session.company] = { count: 0, sumScore: 0, completedCount: 0 };
        }
        companyStatsMap[session.company].count += 1;
        if (session.feedback && session.feedback.length > 0) {
          companyStatsMap[session.company].completedCount += 1;
          companyStatsMap[session.company].sumScore += session.overallScore || 0;
        }
      }
    });

    const companyWiseProgress = Object.entries(companyStatsMap).map(([company, stats]) => ({
      company,
      count: stats.count,
      completedCount: stats.completedCount,
      avgScore: stats.completedCount > 0 ? Math.round(stats.sumScore / stats.completedCount) : 0
    }));

    const performances = Object.entries(categoryScores)
      .filter(([_, stats]) => stats.count > 0)
      .map(([category, stats]) => ({
        category,
        avgScore: Math.round((stats.sum / stats.count) * 10) // Scale to 100
      }));

    // Simple aggregate stats
    const averageAtsScore = await ResumeAnalysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: "$atsScore" } } }
    ]);

    const totalInterviews = await InterviewSession.countDocuments({ userId });
    const totalResumes = await ResumeAnalysis.countDocuments({ userId });
    const totalJDMatches = await JDMatch.countDocuments({ userId });

    res.json({
      latestResume,
      latestInterviews,
      allInterviews,
      companyWiseProgress,
      performances,
      resumeHistory,
      jdMatches,
      scoreTrend,
      stats: {
        avgAts: Math.round(averageAtsScore[0]?.avg || 0),
        totalInterviews,
        totalResumes,
        totalJDMatches,
        avgInterviewConfidence: totalQuestionsEvaluated > 0 ? Math.round((confidenceSum / totalQuestionsEvaluated) * 10) : 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

export default router;
