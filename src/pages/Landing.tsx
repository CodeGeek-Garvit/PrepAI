import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  ArrowRight, 
  FileSearch, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PrepAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
            <Link 
              to="/signup" 
              className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide uppercase">
              Powered by Gemini AI
            </span>
            <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              Master Your Next <br /> 
              <span className="text-brand">Interview with AI</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Personalized resume analysis, ATS scoring, and interactive mock interviews designed to get you hired at top companies.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Boost Your Readiness <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-xl"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Logos Placeholder */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 grayscale opacity-50">
          <div className="flex items-center gap-2 font-bold text-xl uppercase">Google</div>
          <div className="flex items-center gap-2 font-bold text-xl uppercase">Amazon</div>
          <div className="flex items-center gap-2 font-bold text-xl uppercase">Microsoft</div>
          <div className="flex items-center gap-2 font-bold text-xl uppercase">Meta</div>
          <div className="flex items-center gap-2 font-bold text-xl uppercase">Apple</div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to prepare</h2>
            <p className="mt-4 text-lg text-gray-600">Built for the modern job market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileSearch,
                title: "Resume Analysis",
                desc: "Upload your resume for real-time ATS scoring and pinpointed improvement suggestions."
              },
              {
                icon: MessageSquare,
                title: "Mock Interviews",
                desc: "Get personalized questions based on your experience and the role you're targeting."
              },
              {
                icon: BarChart3,
                title: "Actionable Feedback",
                desc: "Receive scores on communication, accuracy, and clarity for every answer you provide."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 text-brand rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-brand rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to land your dream job?</h2>
            <p className="text-indigo-100 text-xl mb-10 max-w-xl mx-auto">
              Join thousands of students and graduates using PrepAI to ace their interviews.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-white text-brand px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Start Free Today
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
              <Briefcase className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900">PrepAI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Contact Us</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 PrepAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
