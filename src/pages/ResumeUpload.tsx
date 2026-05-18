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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported at this time.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(data);
    } catch (err: any) {
      console.error('[Frontend] Resume analysis error:', err);
      const msg = err.response?.data?.message || 'Failed to analyze resume. Please try again.';
      const details = err.response?.data?.details ? ` (${err.response.data.details})` : '';
      setError(`${msg}${details}`);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    const { atsScore, analysis: resAnalysis } = analysis;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ATS Score Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
            <p className="text-gray-500">We've processed your resume using our AI engine. Here's how it ranks for current ATS systems.</p>
          </div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * atsScore) / 100}
                className={cn(
                  "transition-all duration-1000",
                  atsScore > 80 ? "text-green-500" : atsScore > 60 ? "text-yellow-500" : "text-red-500"
                )}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold">{atsScore}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ATS Score</span>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard icon={Award} title="Key Strengths" color="green" items={resAnalysis.strengths} />
          <SectionCard icon={AlertTriangle} title="Weaknesses" color="red" items={resAnalysis.weaknesses} />
          <SectionCard icon={TrendingUp} title="Missing Skills" color="indigo" items={resAnalysis.missingSkills} />
          <SectionCard icon={Lightbulb} title="Success Tips" color="yellow" items={resAnalysis.improvementSuggestions} />
        </div>

        {/* Action Bar */}
        <div className="bg-gray-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">Ready to put this resume to the test?</p>
          <button 
            onClick={() => setAnalysis(null)}
            className="px-6 py-2 bg-white text-gray-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            Start New Analysis
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume AI Analysis</h1>
          <p className="text-gray-500 mt-1">Upload your resume and get instant AI feedback.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Supports: .pdf only</span>
        </div>
      </div>

      {!analysis && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <FileUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Choose your resume</h3>
              <p className="text-gray-500 mt-1 max-w-sm">We'll scan your resume for keyword optimization, formatting, and structural impact.</p>
            </div>

            <div className="relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={cn(
                "p-4 border-2 border-gray-100 rounded-2xl transition-all flex items-center justify-center gap-3",
                file ? "bg-green-50 border-green-200" : "bg-gray-50 group-hover:bg-gray-100"
              )}>
                {file ? (
                  <>
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">{file.name}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 font-medium">Select a PDF file</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full sm:w-64 mx-auto py-4 bg-brand text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>Analyze Now <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {renderAnalysis()}
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, items, color }: { icon: any, title: string, items: string[], color: string }) => {
  const themes: any = {
    green: "bg-green-50 text-green-700 border-green-100 icon-bg-green-100",
    red: "bg-red-50 text-red-700 border-red-100 icon-bg-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 icon-bg-indigo-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100 icon-bg-yellow-100",
  };

  return (
    <div className={cn("p-6 rounded-3xl border shadow-sm space-y-4 bg-white")}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", themes[color].split(' ')[3].replace('icon-bg-', 'bg-'))}>
          <Icon className={cn("w-5 h-5", themes[color].split(' ')[1])} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
            <div className={cn("w-1.5 h-1.5 mt-1.5 rounded-full shrink-0", themes[color].split(' ')[1].replace('text-', 'bg-'))} />
            {item}
          </li>
        ))}
        {(!items || items.length === 0) && <li className="text-gray-400 italic text-sm">No items found</li>}
      </ul>
    </div>
  );
};

export default ResumeUpload;
