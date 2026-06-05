import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);

  // Authenticate session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        if (response.data?.success) {
          setUser(response.data.user);
          if (response.data.user?.selectedRepository) {
            setSelectedRepository(response.data.user.selectedRepository);
          }
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data?.success) {
        setUser(response.data.user);
        if (response.data.user?.selectedRepository) {
          setSelectedRepository(response.data.user.selectedRepository);
        }
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', { username, email, password });
      if (response.data?.success) {
        setUser(response.data.user);
        if (response.data.user?.selectedRepository) {
          setSelectedRepository(response.data.user.selectedRepository);
        }
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      if (response.data?.success) {
        setUser(response.data.user);
        if (response.data.user?.selectedRepository) {
          setSelectedRepository(response.data.user.selectedRepository);
        }
        return { success: true };
      }
      return { success: false, error: 'Google authentication failed' };
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auth/me');
      if (response.data?.success) {
        setUser(response.data.user);
        if (response.data.user?.selectedRepository) {
          setSelectedRepository(response.data.user.selectedRepository);
        }
        return { success: true, user: response.data.user };
      }
      setUser(null);
      setSelectedRepository(null);
      return { success: false };
    } catch (err) {
      setUser(null);
      setSelectedRepository(null);
      return { success: false, error: err.response?.data?.message || 'Failed to refresh auth' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setSelectedRepository(null);
      setRepositories([]);
      setLoading(false);
    }
  };

  // Fetch user's GitHub repositories
  const fetchRepositories = async () => {
    setRepoLoading(true);
    try {
      const response = await axiosInstance.get('/github/repos');
      if (response.data?.success) {
        setRepositories(response.data.repositories);
        return { success: true, repositories: response.data.repositories };
      }
      return { success: false, error: 'Failed to fetch repositories' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch repositories';
      return { success: false, error: message };
    } finally {
      setRepoLoading(false);
    }
  };

  // Fetch branches for a repository
  const fetchBranches = async (owner, repo) => {
    try {
      const response = await axiosInstance.get(`/github/branches/${owner}/${repo}`);
      if (response.data?.success) {
        return { success: true, branches: response.data.branches };
      }
      return { success: false, error: 'Failed to fetch branches' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch branches';
      return { success: false, error: message };
    }
  };

  const fetchFileContent = async (filePath) => {
    try {
      const response = await axiosInstance.get('/github/file-contents', {
        params: { path: filePath },
      });
      if (response.data?.success) {
        return {
          success: true,
          filePath: response.data.filePath,
          baseBranch: response.data.baseBranch,
          featureBranch: response.data.featureBranch,
          baseContent: response.data.baseContent,
          featureContent: response.data.featureContent,
        };
      }
      return { success: false, error: 'Failed to load file contents' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load file contents';
      return { success: false, error: message };
    }
  };

  // Select repository
  const selectRepo = async (owner, repo, baseBranch, featureBranch, aiMonitoring = false) => {
    try {
      const response = await axiosInstance.post('/github/select-repo', {
        owner,
        repo,
        baseBranch,
        featureBranch,
        aiMonitoring,
      });
      if (response.data?.success) {
        setSelectedRepository(response.data.selectedRepository);
        return { success: true, selectedRepository: response.data.selectedRepository };
      }
      return { success: false, error: 'Failed to select repository' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to select repository';
      return { success: false, error: message };
    }
  };

  // Get selected repository
  const getSelectedRepo = async () => {
    try {
      const response = await axiosInstance.get('/github/selected-repo');
      if (response.data?.success) {
        setSelectedRepository(response.data.selectedRepository);
        return { success: true, selectedRepository: response.data.selectedRepository };
      }
      return { success: false, error: 'No repository selected' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'No repository selected' };
    }
  };

  // Toggle AI monitoring
  const toggleAIMonitoring = async (aiMonitoring) => {
    try {
      const response = await axiosInstance.post('/github/toggle-monitoring', { aiMonitoring });
      if (response.data?.success) {
        if (selectedRepository) {
          setSelectedRepository({
            ...selectedRepository,
            aiMonitoring: response.data.aiMonitoring,
          });
        }
        return { success: true, aiMonitoring: response.data.aiMonitoring };
      }
      return { success: false, error: 'Failed to toggle monitoring' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle monitoring';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        refreshAuth,
        logout,
        selectedRepository,
        repositories,
        repoLoading,
        fetchRepositories,
        fetchBranches,
        fetchFileContent,
        selectRepo,
        getSelectedRepo,
        toggleAIMonitoring,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
