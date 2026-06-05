import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { GitBranch, Github, Sparkles, Check, AlertCircle, Loader, RefreshCw } from 'lucide-react';

const RepoManager = () => {
  const {
    repositories,
    repoLoading,
    selectedRepository,
    fetchRepositories,
    fetchBranches,
    selectRepo,
    getSelectedRepo,
    toggleAIMonitoring,
    refreshAuth,
    user,
  } = useAuth();

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [baseBranch, setBaseBranch] = useState('main');
  const [featureBranch, setFeatureBranch] = useState('');
  const [aiMonitoringEnabled, setAiMonitoringEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load repositories and selected repo on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchRepositories();
      const result = await getSelectedRepo();
      if (result.success) {
        setSelectedRepo(result.selectedRepository);
        setBaseBranch(result.selectedRepository.baseBranch || 'main');
        setFeatureBranch(result.selectedRepository.featureBranch || '');
        setAiMonitoringEnabled(result.selectedRepository.aiMonitoring || false);
      }
    };

    const refreshAfterGithubLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('github') === 'connected') {
        await refreshAuth();
        await fetchRepositories();
        const result = await getSelectedRepo();
        if (result.success) {
          setSelectedRepo(result.selectedRepository);
          setBaseBranch(result.selectedRepository.baseBranch || 'main');
          setFeatureBranch(result.selectedRepository.featureBranch || '');
          setAiMonitoringEnabled(result.selectedRepository.aiMonitoring || false);
        }
        setMessage('GitHub login successful.');
        setMessageType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        const url = new URL(window.location.href);
        url.searchParams.delete('github');
        window.history.replaceState({}, document.title, url.toString());
        return;
      }

      await loadData();
    };

    refreshAfterGithubLogin();
  }, []);

  // Fetch branches when repo is selected
  const handleRepoChange = async (repo) => {
    setSelectedRepo(repo);
    setBranchesLoading(true);
    try {
      const result = await fetchBranches(repo.owner.login, repo.name);
      if (result.success) {
        setBranches(result.branches);
        // Set default base branch to main if exists, otherwise first branch
        const mainBranch = result.branches.find((b) => b.name === 'main' || b.name === 'master');
        if (mainBranch) {
          setBaseBranch(mainBranch.name);
        } else if (result.branches.length > 0) {
          setBaseBranch(result.branches[0].name);
        }
        setFeatureBranch('');
      }
    } catch (err) {
      setMessage('Failed to load branches');
      setMessageType('error');
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedRepo || !baseBranch || !featureBranch) {
      setMessage('Please select repository, base branch, and feature branch');
      setMessageType('error');
      return;
    }

    if (baseBranch === featureBranch) {
      setMessage('Base branch and feature branch must be different');
      setMessageType('error');
      return;
    }

    setSaving(true);
    try {
      const result = await selectRepo(
        selectedRepo.owner.login,
        selectedRepo.name,
        baseBranch,
        featureBranch,
        aiMonitoringEnabled
      );

      if (result.success) {
        setSelectedRepo(result.selectedRepository);
        setMessage('Repository configuration saved successfully!');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Failed to save configuration');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error saving configuration');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAI = async (enabled) => {
    if (!selectedRepository) {
      setMessage('No repository selected');
      setMessageType('error');
      return;
    }

    const result = await toggleAIMonitoring(enabled);
    if (result.success) {
      setAiMonitoringEnabled(enabled);
      setMessage(`AI monitoring ${enabled ? 'enabled' : 'disabled'}`);
      setMessageType('success');
    } else {
      setMessage(result.error || 'Failed to toggle AI monitoring');
      setMessageType('error');
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const githubLoginUrl = `${apiUrl.replace(/\/api\/?$/, '')}/api/auth/github/login`;

  const handleGitHubLoginClick = () => {
    if (!githubLoginUrl) {
      setMessage('GitHub login URL is not configured.');
      setMessageType('error');
      return;
    }

    window.location.assign(githubLoginUrl);
  };

  return (
    <div className="flex min-h-screen flex-col bg-darkBg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="mb-6 rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Github className="h-6 w-6 text-accentBlue" />
              <h1 className="text-2xl font-bold text-white">Repository Manager</h1>
            </div>
            <p className="text-sm text-slate-400">
              Connect your GitHub repositories and configure merge conflict resolution settings.
            </p>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                messageType === 'success'
                  ? 'border-accentGreen/30 bg-accentGreen/5 text-accentGreen'
                  : 'border-accentRed/30 bg-accentRed/5 text-accentRed'
              }`}
            >
              <div className="flex items-start gap-2">
                {messageType === 'success' ? (
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Repository List */}
            <div className="lg:col-span-2 rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accentBlue" />
                  Your Repositories
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRepositories}
                    disabled={repoLoading}
                    className="p-2 rounded-lg hover:bg-darkBorder/40 transition disabled:opacity-50"
                    title="Refresh repositories"
                  >
                    <RefreshCw className={`h-4 w-4 ${repoLoading ? 'animate-spin' : ''}`} />
                  </button>

                  {!user?.githubProfile && (
                    <button
                      type="button"
                      onClick={handleGitHubLoginClick}
                      className="rounded-md bg-accentBlue/20 px-3 py-1 text-sm text-accentBlue hover:bg-accentBlue/30"
                    >
                      Login with GitHub
                    </button>
                  )}
                </div>
              </div>

              {repoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-accentBlue" />
                </div>
              ) : repositories.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <Github className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No repositories found. Make sure your GitHub account is connected.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleRepoChange(repo)}
                      className={`w-full text-left rounded-lg border p-3 transition ${
                        selectedRepo?.id === repo.id
                          ? 'border-accentBlue/50 bg-accentBlue/10'
                          : 'border-darkBorder/40 bg-darkPanel/30 hover:bg-darkPanel/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-mono font-semibold text-white">{repo.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{repo.fullName}</p>
                          {repo.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap ml-2 ${
                            repo.visibility === 'public'
                              ? 'bg-accentGreen/10 text-accentGreen'
                              : 'bg-accentYellow/10 text-accentYellow'
                          }`}
                        >
                          {repo.visibility}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {repo.language && <span>{repo.language}</span>}
                        <span>⭐ {repo.stars}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Configuration Panel */}
            <div className="rounded-2xl border border-darkBorder/60 bg-darkPanel/10 p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-accentBlue" />
                Configuration
              </h2>

              {selectedRepo ? (
                <div className="space-y-4">
                  {/* Selected Repository Info */}
                  <div className="rounded-lg bg-darkPanel/50 p-3 border border-darkBorder/40">
                    <p className="text-xs text-slate-400 mb-1">Selected Repository</p>
                    <p className="font-mono font-semibold text-white text-sm">{selectedRepo.name}</p>
                  </div>

                  {/* Base Branch */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">
                      Base Branch
                    </label>
                    {branchesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader className="h-4 w-4 animate-spin text-accentBlue" />
                      </div>
                    ) : (
                      <select
                        value={baseBranch}
                        onChange={(e) => setBaseBranch(e.target.value)}
                        className="w-full rounded-lg border border-darkBorder/40 bg-darkPanel/50 px-3 py-2 text-sm text-white focus:border-accentBlue/50 focus:outline-none"
                      >
                        {branches.map((branch) => (
                          <option key={branch.name} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Feature Branch */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">
                      Feature Branch
                    </label>
                    {branchesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader className="h-4 w-4 animate-spin text-accentBlue" />
                      </div>
                    ) : (
                      <select
                        value={featureBranch}
                        onChange={(e) => setFeatureBranch(e.target.value)}
                        className="w-full rounded-lg border border-darkBorder/40 bg-darkPanel/50 px-3 py-2 text-sm text-white focus:border-accentBlue/50 focus:outline-none"
                      >
                        <option value="">Select branch...</option>
                        {branches.map((branch) => (
                          <option key={branch.name} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* AI Monitoring Toggle */}
                  <div className="rounded-lg bg-darkPanel/30 p-3 border border-darkBorder/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-300">AI Merge Resolver</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Auto-detect and resolve merge conflicts
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleAI(!aiMonitoringEnabled)}
                        disabled={!selectedRepository}
                        className={`relative h-6 w-11 rounded-full transition ${
                          aiMonitoringEnabled
                            ? 'bg-accentGreen/30'
                            : 'bg-slate-700/50'
                        }`}
                      >
                        <div
                          className={`absolute h-5 w-5 top-0.5 rounded-full bg-white transition-transform ${
                            aiMonitoringEnabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveConfig}
                    disabled={saving || !selectedRepo || !baseBranch || !featureBranch}
                    className="w-full rounded-lg bg-accentBlue/20 border border-accentBlue/40 px-4 py-2.5 text-sm font-semibold text-accentBlue transition hover:bg-accentBlue/30 disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save Configuration'
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a repository to configure</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Configuration Display */}
          {selectedRepository && (
            <div className="mt-6 rounded-2xl border border-accentGreen/30 bg-accentGreen/5 p-5">
              <h3 className="text-lg font-semibold text-accentGreen mb-4 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Active Configuration
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-accentGreen/10 p-3 border border-accentGreen/30">
                  <p className="text-xs text-accentGreen/70 mb-1">Repository</p>
                  <p className="font-mono text-sm font-semibold text-white">
                    {selectedRepository.fullName}
                  </p>
                </div>
                <div className="rounded-lg bg-accentGreen/10 p-3 border border-accentGreen/30">
                  <p className="text-xs text-accentGreen/70 mb-1">Base Branch</p>
                  <p className="font-mono text-sm font-semibold text-white">
                    {selectedRepository.baseBranch}
                  </p>
                </div>
                <div className="rounded-lg bg-accentGreen/10 p-3 border border-accentGreen/30">
                  <p className="text-xs text-accentGreen/70 mb-1">Feature Branch</p>
                  <p className="font-mono text-sm font-semibold text-white">
                    {selectedRepository.featureBranch}
                  </p>
                </div>
                <div className="rounded-lg bg-accentGreen/10 p-3 border border-accentGreen/30">
                  <p className="text-xs text-accentGreen/70 mb-1">AI Monitoring</p>
                  <p className="font-mono text-sm font-semibold text-accentGreen">
                    {selectedRepository.aiMonitoring ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showToast && messageType === 'success' && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-accentGreen/30 bg-accentGreen/10 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm">
          <p className="text-sm font-semibold text-white">{message}</p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RepoManager;
