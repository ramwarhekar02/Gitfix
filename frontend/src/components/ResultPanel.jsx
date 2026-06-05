import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import axiosInstance from '../api/axiosInstance';
import { Check, X, Copy, Terminal, Award } from 'lucide-react';

const ResultPanel = ({ result, onUpdateStatus }) => {
  const [feedbackStatus, setFeedbackStatus] = useState(result?.status || 'pending');
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-center p-8 border border-dashed border-darkBorder rounded-2xl bg-slate-900/10">
        <Terminal className="h-10 w-10 text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium">Workspace idle.</p>
        <p className="text-slate-600 text-xs font-mono mt-1">Provide conflict codes on the left and resolve.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.mergedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMergeDecision = async (decision) => {
    try {
      const endpoint = `/merge/${decision}`;
      const response = await axiosInstance.post(endpoint, { analysisId: result._id });
      if (response.data?.success) {
        setFeedbackStatus(decision === 'accept' ? 'accepted' : 'rejected');
        if (onUpdateStatus) {
          onUpdateStatus(result._id, decision === 'accept' ? 'accepted' : 'rejected');
        }
      }
    } catch (err) {
      console.error(`Failed to update decision to ${decision}:`, err);
    }
  };

  return (
    <div className="flex flex-col h-full border border-darkBorder rounded-2xl bg-slate-900/40 overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header Info Panel */}
      <div className="flex items-center justify-between border-b border-darkBorder bg-slate-900/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-accentBlue" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">AI Merge Synthesis</h3>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge score={result.riskScore} />
        </div>
      </div>

      {/* Code output display box */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
        <div className="flex items-center justify-between px-6 py-2 border-b border-darkBorder bg-slate-950/40">
          <span className="text-xs font-mono text-slate-500 uppercase">Merged Output</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-darkPanel text-slate-300 border border-darkBorder hover:bg-slate-700 transition"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <pre className="font-mono text-sm leading-relaxed text-slate-100 whitespace-pre">
            <code>{result.mergedCode}</code>
          </pre>
        </div>
      </div>

      {/* Reason explanation area */}
      <div className="bg-slate-900/60 border-t border-darkBorder p-5">
        <h4 className="text-xs font-mono text-slate-500 uppercase mb-1.5">Decision Logic</h4>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">{result.explanation || 'No reason provided.'}</p>
      </div>

      {/* Review CTA feedback panel */}
      <div className="bg-darkPanel/90 border-t border-darkBorder px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-slate-500 uppercase">Status</span>
          <span
            className={`text-sm font-semibold uppercase ${
              feedbackStatus === 'accepted'
                ? 'text-accentGreen'
                : feedbackStatus === 'rejected'
                ? 'text-accentRed'
                : 'text-accentYellow'
            }`}
          >
            {feedbackStatus}
          </span>
        </div>

        {feedbackStatus === 'pending' ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateMergeDecision('reject')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-accentRed/40 text-accentRed rounded-lg bg-accentRed/5 text-sm font-semibold hover:bg-accentRed/10 transition"
            >
              <X className="h-4 w-4" /> Reject Resolution
            </button>
            <button
              onClick={() => updateMergeDecision('accept')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-accentGreen/40 text-accentGreen rounded-lg bg-accentGreen/5 text-sm font-semibold hover:bg-accentGreen/10 transition"
            >
              <Check className="h-4 w-4" /> Accept Resolution
            </button>
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-400 bg-slate-950/40 py-1.5 px-3 rounded-lg border border-darkBorder/40">
            Feedback Saved
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
