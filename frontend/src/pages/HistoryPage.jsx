import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RiskBadge from '../components/RiskBadge';
import { Calendar, FileText, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get('/history');
        if (response.data?.success) {
          setHistory(response.data.history || []);
        }
      } catch (err) {
        setError('Failed to load merge conflict history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const updateLocalStatus = (id, newStatus) => {
    setHistory((prev) => prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item)));
    if (selectedItem && selectedItem._id === id) {
      setSelectedItem((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const updateMergeDecision = async (id, decision) => {
    try {
      const response = await axiosInstance.post(`/merge/${decision}`, { analysisId: id });
      if (response.data?.success) {
        updateLocalStatus(id, decision === 'accept' ? 'accepted' : 'rejected');
      }
    } catch (err) {
      console.error(`Failed to update decision to ${decision}:`, err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-darkBg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-5 flex min-h-0 flex-col gap-4 rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-darkBorder/40 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold tracking-wider text-slate-400 font-mono uppercase">
                Resolution Logs ({history.length})
              </h2>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-darkBorder bg-darkPanel px-3 py-1.5 text-xs font-mono text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Workspace
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-1 items-center justify-center font-mono text-xs text-slate-500">
                Loading resolution logs...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-accentRed/30 bg-accentRed/5 p-2.5 text-xs font-mono text-accentRed">
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500">
                <FileText className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">No merge resolutions found.</p>
                <p className="mt-1 text-xs font-mono">Resolve conflicts in your workspace first.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {history.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedItem?._id === item._id
                        ? 'border-accentBlue/60 bg-accentBlue/10 shadow-lg'
                        : 'border-darkBorder/60 bg-darkPanel/40 hover:bg-darkPanel/70'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </span>
                      <RiskBadge score={item.riskScore} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-darkBorder/30 pt-3">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'accepted' ? (
                          <CheckCircle2 className="h-4 w-4 text-accentGreen" />
                        ) : item.status === 'rejected' ? (
                          <XCircle className="h-4 w-4 text-accentRed" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-accentYellow" />
                        )}
                        <span className="text-xs font-mono capitalize text-slate-300">{item.status}</span>
                      </div>

                      <span className="max-w-[150px] truncate text-[11px] font-mono text-slate-500">
                        {item.explanation || 'No reason specified'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-7 flex min-h-0 flex-col rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-4 sm:p-5">
            {selectedItem ? (
              <div className="flex min-h-0 flex-col">
                <div className="mb-4 flex items-center justify-between border-b border-darkBorder/40 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Resolution Artifact</h3>
                    <p className="text-[10px] font-mono text-slate-400">ID: {selectedItem._id}</p>
                  </div>
                  <RiskBadge score={selectedItem.riskScore} />
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  <div>
                    <h4 className="mb-1 text-xs font-mono uppercase text-slate-400">AI Merged Code</h4>
                    <pre className="overflow-x-auto whitespace-pre rounded-lg border border-darkBorder bg-slate-950 p-4 font-mono text-sm text-slate-200">
                      <code>{selectedItem.mergedCode}</code>
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-1 text-xs font-mono uppercase text-slate-400">Branch A</h4>
                      <pre className="max-h-40 overflow-y-auto whitespace-pre rounded-lg border border-darkBorder/40 bg-slate-950/60 p-3 font-mono text-xs text-slate-300">
                        <code>{selectedItem.branchA}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-mono uppercase text-slate-400">Branch B</h4>
                      <pre className="max-h-40 overflow-y-auto whitespace-pre rounded-lg border border-darkBorder/40 bg-slate-950/60 p-3 font-mono text-xs text-slate-300">
                        <code>{selectedItem.branchB}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="rounded-lg border border-darkBorder/60 bg-slate-950/30 p-4">
                    <h4 className="mb-1 text-xs font-mono uppercase text-slate-400">Analysis Reason</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{selectedItem.explanation || 'No reason provided.'}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-darkBorder/40 pt-4">
                  <div>
                    <span className="block text-xs font-mono uppercase text-slate-500">Decision Status</span>
                    <span className="text-xs font-semibold capitalize font-mono text-slate-300">{selectedItem.status}</span>
                  </div>

                  {selectedItem.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMergeDecision(selectedItem._id, 'reject')}
                        className="rounded border border-accentRed/30 bg-accentRed/5 px-3 py-1.5 text-xs font-mono text-accentRed transition hover:bg-accentRed/10"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateMergeDecision(selectedItem._id, 'accept')}
                        className="rounded border border-accentGreen/30 bg-accentGreen/5 px-3 py-1.5 text-xs font-mono text-accentGreen transition hover:bg-accentGreen/10"
                      >
                        Accept
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">Feedback submitted</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500">
                <FileText className="mb-2 h-8 w-8" />
                <p className="text-sm font-medium">Select a log artifact</p>
                <p className="mt-1 text-xs font-mono">Review changes, inputs, and analysis rationale details.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
