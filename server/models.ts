import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);

const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  resumeText: String,
  atsScore: Number,
  analysis: {
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    formattingRecommendations: [String],
    improvementSuggestions: [String]
  },
  createdAt: { type: Date, default: Date.now },
});

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  experienceLevel: String,
  techStack: [String],
  questions: [{
    category: String,
    text: String
  }],
  feedback: [{
    questionId: String,
    answer: String,
    evaluation: {
      clarity: Number,
      technicalAccuracy: Number,
      completeness: Number,
      communication: Number,
      overallFeedback: String,
      suggestions: [String],
      confidenceScore: Number
    }
  }],
  createdAt: { type: Date, default: Date.now },
});

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
