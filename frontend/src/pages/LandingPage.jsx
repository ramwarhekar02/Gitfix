import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, RefreshCw, Zap, Server, Code } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Header />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 overflow-hidden border-b border-slate-100 dark:border-darkBorder/40">
        {/* Animated Glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 md:h-96 md:w-96 rounded-full bg-accentBlue/10 dark:bg-accentBlue/5 blur-[80px] -z-10 animate-pulse"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accentBlue/10 text-accentBlue border border-accentBlue/20">
            <Sparkles className="h-3.5 w-3.5" /> AI-Driven Version Controls
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Resolve Git Merge Conflicts <br />
            <span className="bg-gradient-to-r from-accentBlue to-accentGreen bg-clip-text text-transparent">
              Intelligently in Real-Time
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            GitFix parses conflict boundaries, evaluates structural context, and streams optimal resolutions
            via secure WebSockets using state-of-the-art token-optimized AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accentBlue text-white font-semibold shadow-lg hover:bg-blue-600 shadow-accentBlue/20 transition-all duration-200"
            >
              Start Merging Free <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-darkPanel/20 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-darkPanel/50 transition-all duration-200"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Feature Grid / Core Strengths */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Security and Performance
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-500 dark:text-slate-400">
            A production-ready solution implementing strict isolation protocols and secure socket channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkPanel/20 space-y-4 hover:border-accentBlue/50 transition-all duration-300">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accentBlue/10 text-accentBlue">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Powered Synthesis</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Analyzes syntax structure from base context, Branch A, and Branch B to construct optimal resolutions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkPanel/20 space-y-4 hover:border-accentBlue/50 transition-all duration-300">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accentGreen/10 text-accentGreen">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">WebSocket Streaming</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Streams pipeline stage events back to client view scopes. Experience transparent resolution in real-time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkPanel/20 space-y-4 hover:border-accentBlue/50 transition-all duration-300">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accentRed/10 text-accentRed">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">HttpOnly Security</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Zero storage of JWTs in frontend environments. Strictly secured via client-side cookie containers.
            </p>
          </div>
        </div>
      </section>

      {/* Stream Pipeline Visualization */}
      <section className="bg-slate-50 dark:bg-darkPanel/10 border-y border-slate-100 dark:border-darkBorder/40 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-accentGreen/15 text-accentGreen text-xs font-mono">
              ACTIVE PROCESS
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Real-Time Event Processing
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              When a merge conflict payload is submitted, the server spins up a workspace state sequence.
              Progress updates stream directly through socket interfaces to keep you informed:
            </p>
            <ul className="space-y-3 text-xs font-mono text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accentBlue"></span>
                `analysis_started`: Allocating memory workspace
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accentBlue"></span>
                `parsing`: Scanning conflict markers
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accentBlue"></span>
                `ai_processing`: Prompt-optimized code resolution
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accentBlue"></span>
                `risk_check`: Evaluating merge regressions
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/40 pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-accentBlue" />
                <span className="text-xs font-mono text-slate-500">socket.io-stream-agent</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accentGreen/15 text-accentGreen border border-accentGreen/20">
                <span className="h-1.5 w-1.5 rounded-full bg-accentGreen animate-ping"></span>
                Live Event
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-darkBorder/40">
                <span className="text-slate-400">[10:42:15]</span> <span className="text-accentBlue">&lt;client&gt;</span> emit: <span className="text-white">send_conflict</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-darkBorder/40">
                <span className="text-slate-400">[10:42:16]</span> <span className="text-accentGreen">&lt;server&gt;</span> broadcast: <span className="text-accentYellow">parsing_code</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-darkBorder/40">
                <span className="text-slate-400">[10:42:17]</span> <span className="text-accentGreen">&lt;server&gt;</span> broadcast: <span className="text-accentYellow">ai_generating_merge</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-darkBorder/40">
                <span className="text-slate-400">[10:42:19]</span> <span className="text-accentGreen">&lt;server&gt;</span> broadcast: <span className="text-white font-semibold">result_ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Secure Your Development Pipeline Today
        </h2>
        <p className="max-w-lg mx-auto text-slate-500 dark:text-slate-400 text-sm">
          Join thousands of developers using secure workspace merge resolvers to bypass tedious manual fixes.
        </p>
        <Link
          to={user ? '/dashboard' : '/register'}
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-accentBlue text-white font-semibold hover:bg-blue-600 shadow-md transition"
        >
          Access Workspace <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
