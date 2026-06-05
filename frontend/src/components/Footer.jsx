import React from 'react';
import { Terminal, Github, Heart, ShieldCheck, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-darkBorder bg-slate-50/95 dark:bg-darkBg/40 px-4 py-8 transition-colors duration-200 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-accentBlue/10 text-accentBlue">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-300">
            GitFix &copy; {new Date().getFullYear()}
          </span>
        </div>
          <p className="text-xs text-slate-500 font-sans flex flex-wrap items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-current text-accentRed" /> 
          </p>
        </div>

        <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs font-sans text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-darkBorder dark:bg-darkPanel/40">
            Ram Warhekar
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
