import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Cpu, FileJson, PlayCircle } from 'lucide-react';

const ProgressStream = ({ state, message }) => {
  if (!state) return null;

  const steps = [
    { key: 'started', label: 'Initializing', icon: PlayCircle },
    { key: 'parsing', label: 'Parsing Code', icon: FileJson },
    { key: 'ai_processing', label: 'AI Synthesis', icon: Cpu },
    { key: 'risk_check', label: 'Risk Audit', icon: AlertCircle },
  ];

  const getStepStatus = (stepKey) => {
    const order = ['started', 'parsing', 'ai_processing', 'risk_check', 'ready'];
    const currentIndex = order.indexOf(state);
    const stepIndex = order.indexOf(stepKey);

    if (state === 'error') return 'error';
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="rounded-xl border border-darkBorder bg-slate-900/50 p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentGreen opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accentGreen"></span>
        </div>
        <h4 className="text-sm font-semibold tracking-wider text-slate-300 uppercase font-mono">
          Websocket Stream Pipeline
        </h4>
      </div>

      <div className="grid grid-cols-4 gap-4 relative">
        {/* Connector line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-darkBorder -z-10"></div>

        {steps.map((step) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-accentGreen/10 border-accentGreen text-accentGreen'
                    : status === 'active'
                    ? 'bg-accentBlue/20 border-accentBlue text-accentBlue animate-pulse scale-105'
                    : status === 'error'
                    ? 'bg-accentRed/10 border-accentRed text-accentRed'
                    : 'bg-slate-950 border-darkBorder text-slate-600'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : status === 'active' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs font-mono font-medium ${
                  status === 'active'
                    ? 'text-accentBlue'
                    : status === 'completed'
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-darkBorder/40">
          <Loader2 className="h-3 w-3 animate-spin text-accentBlue" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressStream;
