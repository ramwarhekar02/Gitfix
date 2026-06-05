import React from 'react';

const CodeEditor = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </label>
      <div className="relative rounded-lg border border-darkBorder bg-slate-950 overflow-hidden shadow-inner focus-within:border-accentBlue/60 focus-within:ring-1 focus-within:ring-accentBlue/30 transition-all">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '// Paste or write code here...'}
          spellCheck="false"
          className="w-full h-40 bg-transparent py-3 px-4 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
