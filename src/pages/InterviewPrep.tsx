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
  AlertCircle,
  Sparkles,
  Building2,
  Cpu,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Company Branding Badge Helper
export const CompanyLogoBadge = ({ company, size = 'md' }: { company: string, size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-10 h-10 text-xs rounded-xl' : 'w-12 h-12 text-sm rounded-2xl';
  
  if (company === 'Google') {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-100 font-black tracking-tight shrink-0 select-none ${sizeClasses}`}>
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>
    );
  }
  
  if (company === 'Amazon') {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-900 border border-slate-800 font-black text-white shrink-0 select-none ${sizeClasses}`}>
        <span className="text-[10px] leading-none mb-0.5 tracking-tighter text-[#ff9900]">amzn</span>
        <span className="text-amber-500 text-[8px] font-bold leading-none -mt-1 font-sans">➔</span>
      </div>
    );
  }
  
  if (company === 'Microsoft') {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border border-gray-100 gap-1 p-1 shrink-0 select-none ${sizeClasses}`}>
        <div className="grid grid-cols-2 gap-[2px]">
          <div className="w-[6px] h-[6px] bg-[#f25022]"></div>
          <div className="w-[6px] h-[6px] bg-[#7fba00]"></div>
          <div className="w-[6px] h-[6px] bg-[#00a4ef]"></div>
          <div className="w-[6px] h-[6px] bg-[#ffb900]"></div>
        </div>
        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter hidden md:block">MS</span>
      </div>
    );
  }

  if (company === 'TCS') {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-800 text-white font-extrabold tracking-tighter shrink-0 select-none ${sizeClasses}`}>
        TCS
      </div>
    );
  }

  if (company === 'Infosys') {
    return (
      <div className={`flex items-center justify-center bg-indigo-600 border border-indigo-500 text-white font-black italic tracking-tighter shrink-0 select-none ${sizeClasses}`}>
        Infy
      </div>
    );
  }

  if (company === 'Deloitte') {
    return (
      <div className={`flex items-center justify-center bg-black border border-neutral-800 text-white font-bold relative shrink-0 select-none ${sizeClasses}`}>
        D<span className="text-green-500 font-extrabold translate-y-1.5 -ml-0.5">.</span>
      </div>
    );
  }

  if (company === 'Accenture') {
    return (
      <div className={`flex items-center justify-center bg-violet-700 border border-violet-600 text-white font-black shrink-0 select-none ${sizeClasses}`}>
        ac<span className="text-amber-400 font-extrabold ml-0.5">&gt;</span>
      </div>
    );
  }

  if (company === 'Flipkart') {
    return (
      <div className={`flex items-center justify-center bg-yellow-400 border border-yellow-300 text-blue-800 font-extrabold shrink-0 select-none ${sizeClasses}`}>
        F<span className="text-amber-600 font-serif font-black italic">#</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 shrink-0 select-none ${sizeClasses}`}>
      {company ? company.substring(0, 2).toUpperCase() : 'CO'}
    </div>
  );
};

// Company Specific Styles details
const COMPANIES_GUIDES: Record<string, { desc: string; focus: string; color: string }> = {
  Google: {
    desc: "Rigorous standards covering advanced data structures, algorithmic efficiency, and scalable computational concepts.",
    focus: "DSA, time/space optimizations, complex distributed system architectures.",
    color: "border-blue-200 bg-blue-50/40 text-blue-800"
  },
  Amazon: {
    desc: "Built around Core Leadership principles (Ownership, Customer Obsession). Prepares for system scalability alongside behavioral standards.",
    focus: "Customer obsession, extreme system designs, trade-off analysis.",
    color: "border-amber-200 bg-amber-50/40 text-amber-800"
  },
  Microsoft: {
    desc: "Focuses on robust, reliable software craftsmanship, clean debugging systems, functional specifications, and developer collaboration.",
    focus: "Practical diagnostics, runtime debugging, modular software designs.",
    color: "border-cyan-200 bg-cyan-50/40 text-cyan-800"
  },
  TCS: {
    desc: "Covers crucial Computer Science fundamentals, technical core workflows, database logic, and traditional aptitude questions.",
    focus: "CS principles, SQL query architectures, standard technical communication.",
    color: "border-[#005a9c]/20 bg-[#005a9c]/5 text-[#005a9c]"
  },
  Infosys: {
    desc: "Prepares for logic programming exercises, fundamental system diagnostics, and general structural engineering questions.",
    focus: "Logic puzzles, algorithmic loops, client business operations.",
    color: "border-emerald-200 bg-emerald-50/40 text-emerald-800"
  },
  Deloitte: {
    desc: "Centered upon commercial advisory paradigms, client consultation methods, robust risk metrics, and communication excellence.",
    focus: "Business scenario analysis, modern consulting, strategic system planning.",
    color: "border-zinc-350 bg-zinc-50/50 text-zinc-900"
  },
  Accenture: {
    desc: "Prepares for technology delivery, solution architecture designs, large-scale implementation engineering, and consulting logic.",
    focus: "Delivery management, integration technology, collaborative problem solving.",
    color: "border-purple-200 bg-purple-50/40 text-purple-800"
  },
  Flipkart: {
    desc: "Demands knowledge of scalable micro-services, machine translation, complex inventory/order logistics, and optimization under load.",
    focus: "High-throughput systems, caching solutions, architectural clean code.",
    color: "border-yellow-250 bg-yellow-50/40 text-yellow-800"
  }
};

const InterviewPrep = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Questions, 3: Feedback
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'company'>('company');
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Intermediate (Junior/Mid)');
  const [techStack, setTechStack] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [completed, setCompleted] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const stackArray = techStack.split(',').map(s => s.trim()).filter(s => s);
      
      const endpoint = mode === 'company' ? '/interview/generate-company' : '/interview/generate';
      const payload = mode === 'company' 
        ? { company, role, experienceLevel: experience, techStack: stackArray }
        : { role, experienceLevel: experience, techStack: stackArray, resumeText: "" };

      console.log(`[Frontend] Initializing interview with endpoint ${endpoint}`);
      const { data } = await api.post(endpoint, payload);
      
      setSession(data);
      setCurrentIdx(0);
      setCompleted([]);
      setStep(2);
    } catch (err: any) {
      console.error("[Frontend] Generate interview error: ", err);
      // Graceful error display or friendly fallbacks
      const statusText = err.response?.status === 429 
        ? "AI service is currently busy. Showing intelligent fallback analysis." 
        : "Failed to start mock session. Please try again.";
      setErrorMessage(statusText);
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
        sessionId: session._id || session.id,
        questionId: q._id || q.id,
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
      console.error("[Frontend] Eval error: ", err);
      alert('Failed to evaluate answer of this round.');
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  PrepAI Mock Engine
                </h1>
                <p className="text-gray-500 mt-1">Practice, receive real-time evaluations, and supercharge your confidence.</p>
              </div>

              {/* Mode Toggle Controls */}
              <div className="bg-gray-100 p-1 rounded-2xl flex border border-gray-200/50 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => { setMode('company'); setErrorMessage(''); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    mode === 'company' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Company Mode
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('standard'); setErrorMessage(''); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                    mode === 'standard' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-500" /> Standard Mode
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleStart} className="space-y-6">
              {/* Optional interactive click selector of company panels */}
              {mode === 'company' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Select Elite Enterprise Target</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(COMPANIES_GUIDES).map((co) => (
                      <button
                        key={co}
                        type="button"
                        onClick={() => setCompany(co)}
                        className={cn(
                          "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 relative",
                          company === co 
                            ? "bg-indigo-50/50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm" 
                            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                        )}
                      >
                        <CompanyLogoBadge company={co} size="sm" />
                        <span className="text-xs font-bold text-gray-800">{co}</span>
                        {company === co && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Interactive guide description depending on company click */}
                  <div className={cn("p-4 rounded-2xl border text-xs leading-relaxed transition-all mt-4", COMPANIES_GUIDES[company].color)}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      <span className="font-bold uppercase tracking-wider text-[10px]">{company} Assessment Protocol:</span>
                    </div>
                    <p className="opacity-90">{COMPANIES_GUIDES[company].desc}</p>
                    <p className="mt-2 text-[11px] font-semibold">Style priorities: <span className="underline">{COMPANIES_GUIDES[company].focus}</span></p>
                  </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mode === 'company' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Company Dropdown Selector</label>
                      <select
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold text-gray-800"
                      >
                        {Object.keys(COMPANIES_GUIDES).map((co) => (
                          <option key={co} value={co}>{co}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={cn(mode === 'company' ? "" : "md:col-span-1")}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Target Role</label>
                    <input
                      required
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. SDE-II, Systems Engineer"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium text-gray-800"
                    />
                  </div>

                  {mode !== 'company' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Experience Level</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium text-gray-800"
                      >
                        <option>Entry-level</option>
                        <option>Intermediate (Junior/Mid)</option>
                        <option>Senior-level</option>
                        <option>Management</option>
                      </select>
                    </div>
                  )}
                </div>

                {mode === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Experience Level</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium text-gray-800"
                    >
                      <option>Entry-level</option>
                      <option>Intermediate (Junior/Mid)</option>
                      <option>Senior-level</option>
                      <option>Management</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Key Tech Stack (Comma separated)</label>
                  <input
                    required
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. React, Node.js, TypeScript, Systems Design"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium text-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 text-sm justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" /> Customizing corporate questions...
                    </span>
                  ) : (
                    <>Generate Custom Mock Interview <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full mb-2 inline-block">
                  Question {currentIdx + 1} of {session.questions.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  {session.questions[currentIdx].category} Category
                </h2>
              </div>

              {session.isCompanySpecific && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-150 rounded-2xl shadow-sm">
                  <CompanyLogoBadge company={session.company} size="sm" />
                  <div className="hidden sm:block text-left text-[10px] leading-tight">
                    <p className="font-extrabold text-gray-800 uppercase tracking-tighter">{session.company}</p>
                    <p className="text-gray-400">Target Track</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm space-y-8">
              <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-lg font-semibold text-gray-800 leading-relaxed text-center italic">
                  "{session.questions[currentIdx].text}"
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 ml-1">Your Diagnostic Response</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Formulate your response thoroughly. Mention specific architectural practices, algorithmic choices, and technical trade-offs to score high..."
                  rows={6}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm leading-relaxed text-gray-800 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={evaluating || !answer.trim()}
                  className="px-8 py-3.5 bg-brand text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                >
                  {evaluating ? (
                    <span className="flex items-center gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Diagnostic analysis...
                    </span>
                  ) : (
                    <>Submit Round Answer <Send className="w-4 h-4" /></>
                  )}
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
              <h1 className="text-3xl font-black text-gray-900 leading-none">Diagnostic evaluation Finished!</h1>
              <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
                Successfully evaluated target mock session for {role} 
                {session?.isCompanySpecific && ` under the ${session.company} target protocol.`}
              </p>
            </div>

            <div className="space-y-6">
              {completed.map((item, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.category} Round</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{item.text}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand">{item.feedback.confidenceScore}/10</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest">Submitted Response</p>
                      <p className="text-gray-650 text-sm leading-relaxed italic">"{item.userAnswer}"</p>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 tracking-widest">Confidence Scores & Feedback</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <ScoreBadge label="Clarity" score={item.feedback.clarity} />
                        <ScoreBadge label="Technical" score={item.feedback.technicalAccuracy} />
                        <ScoreBadge label="Completeness" score={item.feedback.completeness} />
                        <ScoreBadge label="Comms" score={item.feedback.communication} />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-50">
                        {item.feedback.overallFeedback}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-900">Recommended Enhancements:</p>
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

            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
              >
                <RefreshCcw className="w-5 h-5" /> Retake or Try Different Target
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
