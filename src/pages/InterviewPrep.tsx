import React, { useState } from 'react';
import api from '../services/api.ts';
import { 
  Briefcase, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  Send,
  CheckCircle2,
  Trophy,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const InterviewPrep = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Questions, 3: Feedback
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Entry-level');
  const [techStack, setTechStack] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [completed, setCompleted] = useState<any[]>([]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stackArray = techStack.split(',').map(s => s.trim()).filter(s => s);
      const { data } = await api.post('/interview/generate', {
        role,
        experienceLevel: experience,
        techStack: stackArray,
        resumeText: "" // For simplicity, we skip full resume context here unless available
      });
      setSession(data);
      setStep(2);
    } catch (err) {
      alert('Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) return;
    
    setEvaluating(true);
    try {
      const q = session.questions[currentIdx];
      const { data } = await api.post('/interview/evaluate', {
        sessionId: session._id,
        questionId: q._id,
        questionText: q.text,
        answer
      });
      
      setCompleted([...completed, { ...q, feedback: data.evaluation, userAnswer: answer }]);
      setAnswer('');
      
      if (currentIdx < session.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setStep(3);
      }
    } catch (err) {
      alert('Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tailored Mock Interview</h1>
              <p className="text-gray-500 mt-1">Tell us about the role you're targeting.</p>
            </div>

            <form onSubmit={handleStart} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Target Role</label>
                  <input
                    required
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option>Entry-level</option>
                    <option>Intermediate (Junior/Mid)</option>
                    <option>Senior-level</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Key Tech Stack (Comma separated)</label>
                <input
                  required
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Generate Questions <ChevronRight className="w-5 h-5" /></>}
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && session && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full mb-2 inline-block">
                  Question {currentIdx + 1} of {session.questions.length}
                </span>
                <h2 className="text-3xl font-bold text-gray-900">{session.questions[currentIdx].category} Round</h2>
              </div>
              <div className="text-gray-400 text-sm font-medium">
                {Math.round((currentIdx / session.questions.length) * 100)}% Complete
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-medium text-gray-800 leading-relaxed">
                  "{session.questions[currentIdx].text}"
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 ml-1">Your Response</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... try to be specific and detailed."
                  rows={6}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleNext}
                  disabled={evaluating || !answer.trim()}
                  className="px-8 py-3 bg-brand text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                >
                  {evaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Answer <Send className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Session Complete!</h1>
              <p className="text-gray-500 mt-2 text-lg">You've successfully finished your mock interview for {role}.</p>
            </div>

            <div className="space-y-6">
              {completed.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-50 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.category}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{item.text}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand">{item.feedback.confidenceScore}/10</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Your Answer</p>
                      <p className="text-gray-600 text-sm leading-relaxed italic">"{item.userAnswer}"</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Evaluation</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <ScoreBadge label="Clarity" score={item.feedback.clarity} />
                        <ScoreBadge label="Technical" score={item.feedback.technicalAccuracy} />
                        <ScoreBadge label="Completeness" score={item.feedback.completeness} />
                        <ScoreBadge label="Comms" score={item.feedback.communication} />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-50">
                        {item.feedback.overallFeedback}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-900">Key Suggestions:</p>
                        {item.feedback.suggestions.map((s: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-brand font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
              >
                <RefreshCcw className="w-5 h-5" /> Retake or Try Different Role
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScoreBadge = ({ label, score }: { label: string, score: number }) => (
  <div className="bg-white border border-gray-100 p-2 rounded-xl flex items-center justify-between shadow-sm">
    <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
    <span className={cn(
      "text-xs font-bold",
      score >= 8 ? "text-green-600" : score >= 5 ? "text-yellow-600" : "text-red-600"
    )}>{score}/10</span>
  </div>
);

export default InterviewPrep;
