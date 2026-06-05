import React, { useState } from 'react';
import { useConflict } from '../hooks/useConflict';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CodeEditor from '../components/CodeEditor';
import ProgressStream from '../components/ProgressStream';
import ResultPanel from '../components/ResultPanel';
import { Code, Sparkles, RefreshCw, Github, Check, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const {
    baseCode,
    setBaseCode,
    branchA,
    setBranchA,
    branchB,
    setBranchB,
    clearInputs,
    loadExample,
  } = useConflict();

  const {
    progressState,
    progressMessage,
    result,
    error: socketError,
    sendConflict,
    resetProgress,
  } = useSocket();

  const { selectedRepository, fetchFileContent } = useAuth();

  const [localError, setLocalError] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileMessage, setFileMessage] = useState('');
  const [fileMessageType, setFileMessageType] = useState('success');

  const handleResolve = (e) => {
    e.preventDefault();
    setLocalError('');

    const finalBaseCode = baseCode.trim() || branchB.trim() || branchA.trim();

    if (!finalBaseCode || !branchA.trim() || !branchB.trim()) {
      setLocalError('Branch A and Branch B code inputs are required to analyze conflicts.');
      return;
    }

    sendConflict(finalBaseCode, branchA, branchB);
  };

  const handleClear = () => {
    clearInputs();
    resetProgress();
    setLocalError('');
  };

  const handleLoadFile = async () => {
    setLocalError('');
    if (!selectedRepository) {
      setLocalError('Please connect a repository first.');
      return;
    }

    if (!filePath.trim()) {
      setLocalError('Please enter a repository file path to load.');
      return;
    }

    setFileLoading(true);
    try {
      const response = await fetchFileContent(filePath.trim());
      if (response.success) {
        setBranchA(response.featureContent);
        setBranchB(response.baseContent);
        setBaseCode('');
        setLocalError('');
        setFileMessage('Loaded file contents from selected repository.');
        setFileMessageType('success');
      } else {
        setLocalError(response.error || 'Failed to load file contents.');
        setFileMessage('');
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to load file from repository.');
      setFileMessage('');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-darkBg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-7xl">
          {/* Connected Repository Status Section */}
          {selectedRepository ? (
            <div className="mb-6 rounded-2xl border border-accentGreen/30 bg-accentGreen/5 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-accentGreen mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Connected Repository Status
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-accentGreen/70 mb-1">Repository</p>
                      <p className="font-mono text-sm font-semibold text-white">
                        {selectedRepository.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-accentGreen/70 mb-1">Base Branch</p>
                      <p className="font-mono text-sm font-semibold text-white">
                        {selectedRepository.baseBranch}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-accentGreen/70 mb-1">Feature Branch</p>
                      <p className="font-mono text-sm font-semibold text-white">
                        {selectedRepository.featureBranch}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-accentGreen/70 mb-1">AI Monitoring</p>
                      <p className="font-mono text-sm font-semibold">
                        {selectedRepository.aiMonitoring ? (
                          <span className="text-accentGreen">✓ Enabled</span>
                        ) : (
                          <span className="text-yellow-400">⚠ Disabled</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/repo-manager"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-accentGreen/40 bg-accentGreen/10 px-3 py-2 text-xs font-mono text-accentGreen transition hover:bg-accentGreen/20 whitespace-nowrap"
                >
                  <Github className="h-3.5 w-3.5" /> Manage
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                      No Repository Connected
                    </h2>
                    <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                      Connect a GitHub repository to enable AI monitoring and automated conflict resolution.
                    </p>
                  </div>
                </div>
                <Link
                  to="/repo-manager"
                  className="ml-4 inline-flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-mono text-yellow-600 dark:text-yellow-400 transition hover:bg-yellow-500/20 whitespace-nowrap flex-shrink-0"
                >
                  <Github className="h-3.5 w-3.5" /> Connect Repository
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-6 flex min-h-0 flex-col gap-5 rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-4 sm:p-5">
            <div className="flex flex-col gap-3 border-b border-darkBorder/40 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4.5 w-4.5 text-accentBlue" />
                <h2 className="text-sm font-semibold text-slate-200">Conflict Workspace</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={loadExample}
                  className="inline-flex items-center gap-1 rounded-lg border border-accentBlue/20 bg-accentBlue/10 px-2.5 py-1 text-xs font-mono text-accentBlue transition hover:bg-accentBlue/20"
                >
                  <Sparkles className="h-3 w-3" /> Load Example
                </button>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 rounded-lg border border-darkBorder bg-darkPanel px-2.5 py-1 text-xs font-mono text-slate-400 transition hover:bg-slate-700 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>

            {selectedRepository && (
              <div className="rounded-2xl border border-darkBorder/40 bg-slate-950/10 p-4 text-sm text-slate-300">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
                      Load file from {selectedRepository.fullName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Base branch: {selectedRepository.baseBranch} • Feature branch: {selectedRepository.featureBranch}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      placeholder="path/to/file.js"
                      className="w-full rounded-lg border border-darkBorder bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-accentBlue/60 focus:outline-none sm:w-72"
                    />
                    <button
                      type="button"
                      onClick={handleLoadFile}
                      disabled={fileLoading}
                      className="inline-flex items-center justify-center rounded-lg border border-accentBlue/20 bg-accentBlue/10 px-3 py-2 text-xs font-mono text-accentBlue transition hover:bg-accentBlue/20 disabled:opacity-50"
                    >
                      {fileLoading ? 'Loading…' : 'Load file'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleResolve} className="flex min-h-0 flex-1 flex-col gap-4">
              {fileMessage && (
                <div
                  className={`rounded-lg border p-2.5 text-xs font-mono ${
                    fileMessageType === 'success'
                      ? 'border-accentGreen/30 bg-accentGreen/5 text-accentGreen'
                      : 'border-accentRed/30 bg-accentRed/5 text-accentRed'
                  }`}
                >
                  {fileMessage}
                </div>
              )}
              {localError && (
                <div className="rounded-lg border border-accentRed/30 bg-accentRed/5 p-2.5 text-xs font-mono text-accentRed">
                  {localError}
                </div>
              )}
              {socketError && (
                <div className="rounded-lg border border-accentRed/30 bg-accentRed/5 p-2.5 text-xs font-mono text-accentRed">
                  {socketError}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <CodeEditor
                  label="Base Code (Optional Context)"
                  value={baseCode}
                  onChange={setBaseCode}
                  placeholder="// Paste base parent version of file here (helps AI context)..."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CodeEditor
                    label={`Branch A Code (${selectedRepository?.featureBranch || 'Current Change'})`}
                    value={branchA}
                    onChange={setBranchA}
                    placeholder="// Paste files from Branch A (your current branch)..."
                  />
                  <CodeEditor
                    label={`Branch B Code (${selectedRepository?.baseBranch || 'Incoming Change'})`}
                    value={branchB}
                    onChange={setBranchB}
                    placeholder="// Paste files from Branch B (incoming conflict changes)..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={progressState && progressState !== 'ready' && progressState !== 'error'}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accentBlue py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4.5 w-4.5" />
                {progressState && progressState !== 'ready' && progressState !== 'error'
                  ? 'Processing Stream...'
                  : 'Resolve Conflict'}
              </button>
            </form>
          </section>

          <section className="lg:col-span-6 flex min-h-0 flex-col gap-5">
            {progressState && progressState !== 'ready' && progressState !== 'error' && (
              <ProgressStream state={progressState} message={progressMessage} />
            )}

            <div className="min-h-0 flex-1">
              <ResultPanel result={result} />
            </div>
          </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
