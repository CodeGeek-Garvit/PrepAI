import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.ts';
import { 
  BarChart3, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  ArrowUpRight, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  X,
  Award,
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setData(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse text-gray-400">
      <div className="h-64 bg-white border border-gray-100 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-40 bg-white border border-gray-100 rounded-3xl" />
        <div className="h-40 bg-white border border-gray-100 rounded-3xl" />
        <div className="h-40 bg-white border border-gray-100 rounded-3xl" />
      </div>
    </div>
  );

  const stats = [
    { label: 'Avg ATS Score', value: `${data?.stats?.avgAts || 0}%`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interviews Prep', value: data?.stats?.totalInterviews || 0, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'JD Matches', value: data?.stats?.totalJDMatches || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartData = data?.scoreTrend?.map((item: any) => ({
    date: new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: item.atsScore
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, Hero! 👋</h1>
          <p className="text-indigo-100 max-w-lg mb-6">
            Ready to prepare for your next career milestone? Use our AI tools to boost your confidence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/resume" 
              className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-all shadow-lg shadow-indigo-900/20"
            >
              Analyze Resume <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/interview" 
              className="px-6 py-2.5 bg-indigo-500/30 text-white border border-white/20 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-indigo-500/50 transition-all"
            >
              Mock Interview <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>

      {/* Stats Grid & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">ATS Score Trend</h3>
              <p className="text-sm text-gray-500">Your resume performance over time</p>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <BarChart3 className="w-12 h-12 opacity-20" />
                <p className="text-sm">Not enough data to show trend</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {data?.latestInterviews?.length > 0 || data?.resumeHistory?.length > 0 || data?.jdMatches?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {data.resumeHistory.map((res: any, i: number) => (
                  <div key={`res-${i}`} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Resume: {res.filename}</p>
                        <p className="text-sm text-gray-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{res.atsScore}</span>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">ATS SCORE</span>
                      </div>
                      <button 
                        onClick={() => setSelectedResult({ type: 'resume', data: res })}
                        className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Details <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {data.jdMatches?.map((match: any, i: number) => (
                  <div key={`jd-${i}`} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Job Match: {match.jobTitle}</p>
                        <p className="text-sm text-gray-500">{match.uploadedResumeName} • {new Date(match.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className={cn(
                          "text-lg font-bold",
                          match.matchScore > 80 ? "text-green-600" : match.matchScore > 60 ? "text-yellow-600" : "text-red-500"
                        )}>{match.matchScore}%</span>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold text-right">MATCH</span>
                      </div>
                      <button 
                        onClick={() => setSelectedResult({ type: 'jdMatch', data: match })}
                        className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Details <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {data.latestInterviews.map((int: any, i: number) => (
                  <div key={`int-${i}`} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {int.isCompanySpecific ? (
                        <CompanyLogoBadge company={int.company} size="sm" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {int.isCompanySpecific ? `${int.company} Mock Interview` : `${int.role} Prep`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {int.questions.length} Questions • {new Date(int.createdAt).toLocaleDateString()}
                          {int.isCompanySpecific && (
                            <span className="ml-2 text-[10px] font-bold text-brand bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              Enterprise Mode
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {int.overallScore > 0 && (
                        <div className="text-right">
                          <span className="text-lg font-bold text-indigo-600">{int.overallScore}%</span>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold text-right">SCORE</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setSelectedResult({ type: 'interview', data: int })}
                        className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Details <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No activity yet. Start by uploading your resume or targeting complex company tracks!</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Suggestion */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Smart Guide</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="w-1.5 h-auto bg-green-500 rounded-full" />
              <div>
                <p className="font-bold text-gray-900">Resume Status</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {data?.latestResume 
                    ? `Your last ATS score for "${data.latestResume.filename}" was ${data.latestResume.atsScore}%` 
                    : "You haven't uploaded a resume yet. Let's get started!"}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
              <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Hero Tip
              </p>
              <p className="text-xs text-yellow-700 mt-2 leading-relaxed">
                Unlock "Company-Specific Mode" under Mock Interviews to tailor metrics directly for elite companies like Google, Amazon, or Accenture!
              </p>
            </div>

            <Link 
              to="/interview" 
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              Start Company Prep Now
            </Link>
          </div>
        </div>
      </div>

      {/* Enterprise Milestones & Interview Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company-Wise Progress Tracking */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Companywise Milestones
            </h3>
            <p className="text-sm text-gray-400 mt-1">Enterprise-tailored mock interview performance tracking</p>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {data?.companyWiseProgress && data.companyWiseProgress.length > 0 ? (
              data.companyWiseProgress.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <CompanyLogoBadge company={item.company} size="sm" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.company} Practice</p>
                      <p className="text-xs text-gray-400">{item.count} mock sessions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-bold text-brand uppercase tracking-wider rounded-lg border border-indigo-100">
                      Active
                    </span>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-black",
                        item.avgScore >= 80 ? "text-green-600" : item.avgScore >= 50 ? "text-indigo-600" : "text-gray-500"
                      )}>{item.avgScore || 0}%</span>
                      <span className="text-[9px] text-gray-400 block font-bold tracking-widest leading-none">AVG SCORE</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No corporate interview sessions listed. Start training today!</p>
                <Link to="/interview" className="text-xs font-bold text-indigo-600 mt-2 block hover:underline">Launch Enterprise Prep Session →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Round Performance Breakdown stats */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Interview Performance Stats
            </h3>
            <p className="text-sm text-gray-400 mt-1">Average confidence level percentages by category rounds</p>
          </div>

          <div className="space-y-5">
            {data?.performances && data.performances.length > 0 ? (
              data.performances.map((perf: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{perf.category} Round</span>
                    <span className="text-gray-900 font-bold">{perf.avgScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${perf.avgScore}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <p className="text-sm">Generate metrics by completing questions inside your interview prep!</p>
                <Link to="/interview" className="text-xs font-bold text-brand block hover:underline">Get started with standard or company mock rounds</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex items-center justify-between z-20">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedResult.type === 'resume' ? 'Analysis Result' : 'Interview Session'}
                </h3>
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-8">
                {selectedResult.type === 'resume' ? (
                  <ResumeResultView analysis={selectedResult.data} />
                ) : selectedResult.type === 'jdMatch' ? (
                  <JDMatchResultView match={selectedResult.data} />
                ) : (
                  <InterviewResultView session={selectedResult.data} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        <span className="text-[10px] leading-none mb-0.5 tracking-tighter">amzn</span>
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

const ResumeResultView = ({ analysis }: { analysis: any }) => {
  const { atsScore, analysis: resAnalysis, filename, isFallback } = analysis;

  return (
    <div className="space-y-8">
      {isFallback && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="text-xs">
            <p className="font-bold">AI Fallback Analysis</p>
            <p className="opacity-80 leading-relaxed text-[10px]">This report was generated using our fallback system because the main AI was unavailable at the time of processing.</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pb-6 border-b border-gray-50">
        <div>
          <p className="text-sm font-bold text-indigo-600 mb-1 uppercase tracking-wider">File Analyzed</p>
          <h4 className="text-xl font-bold text-gray-900">{filename}</h4>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-4xl font-black text-indigo-600 leading-none">{atsScore}<span className="text-lg">%</span></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">ATS Match</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SectionItem icon={Award} title="Top Strengths" color="green" items={resAnalysis.strengths} />
        <SectionItem icon={AlertTriangle} title="Areas for Improvement" color="red" items={resAnalysis.weaknesses} />
        <SectionItem icon={TrendingUp} title="Recommended Skills" color="indigo" items={resAnalysis.missingSkills} />
        <SectionItem icon={Lightbulb} title="Format & Impact Tips" color="yellow" items={resAnalysis.improvementSuggestions} />
      </div>
    </div>
  );
};

const JDMatchResultView = ({ match }: { match: any }) => {
  const { matchScore, matchingSkills, missingSkills, atsKeywords, suggestions, hiringProbability, jobTitle, uploadedResumeName, isFallback } = match;

  return (
    <div className="space-y-8">
      {isFallback && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="text-xs">
            <p className="font-bold">AI Fallback Match</p>
            <p className="opacity-80 leading-relaxed text-[10px]">This match was calculated using our fallback system because the main AI was unavailable at the time of processing.</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pb-6 border-b border-gray-50">
        <div>
          <p className="text-sm font-bold text-indigo-600 mb-1 uppercase tracking-wider">Job Match Analysis</p>
          <h4 className="text-xl font-bold text-gray-900">{jobTitle}</h4>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Resume: {uploadedResumeName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn(
            "text-4xl font-black leading-none",
            matchScore > 80 ? "text-green-600" : matchScore > 60 ? "text-yellow-600" : "text-red-500"
          )}>{matchScore}<span className="text-lg">%</span></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Match Score</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
        <span className="text-sm font-bold text-gray-600">Hiring Probability</span>
        <span className={cn(
           "px-3 py-1 rounded-lg text-sm font-black uppercase tracking-wider",
           hiringProbability === 'High' ? "bg-green-100 text-green-700" : hiringProbability === 'Medium' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
        )}>{hiringProbability}</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SectionItem icon={Award} title="Matching Skills" color="green" items={matchingSkills} />
        <SectionItem icon={AlertTriangle} title="Missing Requirements" color="red" items={missingSkills} />
        <SectionItem icon={Target} title="Keywords for ATS" color="indigo" items={atsKeywords} />
        <SectionItem icon={Lightbulb} title="Success Suggestions" color="yellow" items={suggestions} />
      </div>
    </div>
  );
};

const InterviewResultView = ({ session }: { session: any }) => {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-50 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">
            {session.isCompanySpecific ? `${session.company} Mock Interview` : 'Mock Interview'}
          </p>
          <h4 className="text-xl font-bold text-gray-900">{session.role} Role</h4>
          <p className="text-gray-500 text-xs mt-1">
            {session.questions.length} questions • Created {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
        {session.isCompanySpecific ? (
          <div className="flex items-center gap-3">
            {session.overallScore > 0 && (
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600 leading-none">{session.overallScore}%</span>
                <span className="text-[9px] text-gray-400 block font-bold mt-0.5">OVERALL</span>
              </div>
            )}
            <CompanyLogoBadge company={session.company} />
          </div>
        ) : (
          session.overallScore > 0 && (
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 leading-none">{session.overallScore}%</span>
              <span className="text-[9px] text-gray-400 block font-bold mt-0.5">OVERALL</span>
            </div>
          )
        )}
      </div>
      
      {session.feedback && session.feedback.length > 0 ? (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <p className="font-bold text-gray-800 text-sm">Evaluated Session Rounds:</p>
          {session.feedback.map((item: any, i: number) => {
            const questionObj = session.questions.find((q: any) => q._id?.toString() === item.questionId || q.id === item.questionId);
            return (
              <div key={i} className="bg-gray-50 p-4 border border-gray-100 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {questionObj?.category || 'Round'}
                    </span>
                    <p className="text-sm font-bold text-gray-800 mt-1">{questionObj?.text || 'Question'}</p>
                  </div>
                  <span className="text-xs shrink-0 bg-white border border-gray-100 font-extrabold text-brand px-2 py-1 rounded-xl">
                    {item.evaluation?.confidenceScore || 7}/10
                  </span>
                </div>
                <div className="bg-white/80 border border-gray-100 p-3 rounded-xl text-xs space-y-2">
                  <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Your Answer:</p>
                  <p className="text-gray-700 italic">"{item.answer}"</p>
                  <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mt-2">AI Feedback:</p>
                  <p className="text-gray-600 leading-relaxed">{item.evaluation?.overallFeedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <h5 className="font-bold text-gray-950 text-sm">Questions List:</h5>
          {session.questions.map((q: any, i: number) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl flex gap-4 text-xs text-gray-700 border border-gray-100">
              <span className="font-bold text-indigo-600">Q{i+1}</span>
              {q.text}
            </div>
          ))}
        </div>
      )}

      <Link 
        to="/interview" 
        className="block text-center py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-colors"
      >
        Start New Interview Practice
      </Link>
    </div>
  );
};

const SectionItem = ({ icon: Icon, title, items, color }: { icon: any, title: string, items: string[], color: string }) => {
  const themes: any = {
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${themes[color].split(' ')[1]}`} />
        <h5 className="font-bold text-gray-900">{title}</h5>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items?.map((item, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${themes[color]} text-sm leading-relaxed`}>
            {item}
          </div>
        ))}
        {(!items || items.length === 0) && <p className="text-gray-400 italic text-sm px-2">No specific items flagged.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
