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
  isFallback: { type: Boolean, default: false },
  fallbackReason: String,
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
  company: { type: String, default: null },
  isCompanySpecific: { type: Boolean, default: false },
  overallScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

const jdMatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedResumeName: String,
  jobTitle: String,
  matchScore: Number,
  matchingSkills: [String],
  missingSkills: [String],
  atsKeywords: [String],
  suggestions: [String],
  hiringProbability: String,
  isFallback: { type: Boolean, default: false },
  fallbackReason: String,
  createdAt: { type: Date, default: Date.now },
});

export const JDMatch = mongoose.model('JDMatch', jdMatchSchema);
