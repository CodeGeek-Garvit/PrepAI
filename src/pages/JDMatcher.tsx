import React, { useState } from 'react';
import api from '../services/api.ts';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  Briefcase,
  Zap,
  Layout,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const JDMatcher = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const { data } = await api.post('/jd-match/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Comparison failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const { matchScore, matchingSkills, missingSkills, atsKeywords, suggestions, hiringProbability, jobTitle } = result;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Score Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Analysis Complete</span>
                </div>
                <h2 className="text-4xl font-black mb-2">{jobTitle || 'Job Fit Analysis'}</h2>
                <p className="text-indigo-100 text-lg opacity-80 uppercase tracking-widest font-bold flex items-center justify-center md:justify-start gap-2">
                  Hiring Probability: <span className={cn(
                    "px-3 py-0.5 rounded-lg text-sm",
                    hiringProbability === 'High' ? "bg-green-400 text-green-950" : hiringProbability === 'Medium' ? "bg-yellow-400 text-yellow-950" : "bg-red-400 text-red-950"
                  )}>{hiringProbability}</span>
                </p>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse group-hover:scale-125 transition-transform"></div>
                <div className="relative w-48 h-48 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-full border-4 border-white/30">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                    <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={464.7} strokeDashoffset={464.7 - (464.7 * matchScore) / 100} className="text-white transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black leading-none">{matchScore}<span className="text-2xl opacity-60">%</span></span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ResultSection icon={CheckCircle2} title="Matching Skills" color="green" items={matchingSkills} />
              <ResultSection icon={AlertCircle} title="Missing Requirements" color="red" items={missingSkills} />
              <ResultSection icon={Target} title="ATS Keywords Found" color="indigo" items={atsKeywords} />
              <ResultSection icon={Sparkles} title="AI Optimization Advice" color="yellow" items={suggestions} />
            </div>
          </div>

          <div className="bg-gray-50 px-12 py-6 flex items-center justify-between border-t border-gray-100">
            <p className="text-gray-500 font-medium italic text-sm">Target: {result.uploadedResumeName}</p>
            <button 
              onClick={() => setResult(null)}
              className="text-indigo-600 font-bold hover:underline"
            >
              Check Another Job
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold border border-indigo-100 mb-2">
          <Zap className="w-4 h-4 fill-indigo-600" /> New Feature
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">Resume vs Job Matcher</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and paste a job description. We'll tell you how likely you are to pass the screening and what's missing.
        </p>
      </div>

      {!result && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Left: Inputs */}
          <div className="space-y-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Resume */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-lg font-bold text-gray-900">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black">1</div>
                  Upload Your Resume
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={cn(
                    "p-6 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3",
                    file ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/10"
                  )}>
                    {file ? (
                      <>
                        <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                          <FileText className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-green-700">{file.name}</p>
                        <p className="text-xs text-green-600/60 uppercase font-black">Ready to Analyze</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white text-gray-400 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-gray-600">Select Resume PDF</p>
                        <p className="text-xs text-gray-400">Drag & drop or browse</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: JD */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-lg font-bold text-gray-900">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black">2</div>
                  Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description text here..."
                  className="w-full h-64 p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all resize-none font-medium text-gray-700"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold border border-red-100 uppercase tracking-wide">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file || !jobDescription}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-200 group overflow-hidden relative"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Layout className="w-6 h-6" />
                    <span>Calculate Compatibility</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
                {loading && (
                   <div className="absolute inset-0 bg-white/20 animate-[loading_2s_infinite]"></div>
                )}
              </button>
            </form>
          </div>

          {/* Right: Info/Guide */}
          <div className="hidden lg:flex flex-col gap-8 justify-center">
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="p-4 bg-green-50 rounded-2xl w-fit">
                    <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">AI Comparison Engine</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                   Our advanced Gemini-powered engine scans every word in your resume against the job requirements. We reveal hidden keywords you missed and estimate your hiring chances accurately.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900">98%</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Format</p>
                        <p className="text-2xl font-bold text-gray-900">Any PDF</p>
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                {[
                    { label: 'Keyword Density', icon: Target },
                    { label: 'Role Alignment', icon: Briefcase },
                    { label: 'Skill Gap', icon: Layout },
                    { label: 'Success Chance', icon: TrendingUp }
                ].map((item, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-3xl flex flex-col gap-3 group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                        <item.icon className="w-8 h-8 text-indigo-600" />
                        <p className="font-black text-gray-900 text-sm uppercase tracking-wide">{item.label}</p>
                    </div>
                ))}
             </div>
          </div>
        </motion.div>
      )}

      {renderResult()}
    </div>
  );
};

const ResultSection = ({ icon: Icon, title, items, color }: { icon: any, title: string, items: string[], color: string }) => {
  const themes: any = {
    green: "bg-green-50 text-green-700 border-green-100 icon-bg-green-500",
    red: "bg-red-50 text-red-700 border-red-100 icon-bg-red-500",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 icon-bg-indigo-500",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100 icon-bg-yellow-500",
  };

  return (
    <div className={cn("space-y-4")}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl text-white", themes[color].split(' ')[3].replace('icon-bg-', 'bg-'))}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items?.map((item, i) => (
          <span key={i} className={cn(
            "px-4 py-2 rounded-2xl border text-sm font-bold",
            themes[color]
          )}>
            {item}
          </span>
        ))}
        {(!items || items.length === 0) && <p className="text-gray-400 italic text-sm py-2">No specific items flagged.</p>}
      </div>
    </div>
  );
};

export default JDMatcher;
