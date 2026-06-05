const githubService = require('../services/githubService');
const User = require('../models/User');

const getDecryptedGitHubToken = (user) => {
  if (!user || !user.githubToken) {
    return '';
  }

  const token = typeof user.getGitHubToken === 'function' ? user.getGitHubToken() : '';

  if (token && !user.githubToken.startsWith('enc:') && typeof user.setGitHubToken === 'function') {
    user.setGitHubToken(token);
    user.save().catch(() => {});
  }

  return token;
};

/**
 * @desc    Get user's GitHub repositories
 * @route   GET /api/github/repos
 * @access  Private
 */
const getUserRepositories = async (req, res) => {
  try {
    const githubToken = getDecryptedGitHubToken(req.user);

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token not found. Please connect your GitHub account.',
      });
    }

    const repos = await githubService.fetchUserRepositories(githubToken);

    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      visibility: repo.private ? 'private' : 'public',
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      lastUpdated: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar: repo.owner.avatar_url,
      },
    }));

    res.json({
      success: true,
      repositories: formattedRepos,
      total: formattedRepos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get branches for a specific repository
 * @route   GET /api/github/branches/:owner/:repo
 * @access  Private
 */
const getRepositoryBranches = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const githubToken = getDecryptedGitHubToken(req.user);

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token not found. Please connect your GitHub account.',
      });
    }

    const branches = await githubService.fetchRepositoryBranches(githubToken, owner, repo);

    const formattedBranches = branches.map((branch) => ({
      name: branch.name,
      isDefault: branch.protected,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url,
      },
    }));

    res.json({
      success: true,
      branches: formattedBranches,
      total: formattedBranches.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Load file contents from the selected GitHub repository branches
 * @route   GET /api/github/file-contents
 * @access  Private
 */
const getFileContents = async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.selectedRepository) {
      return res.status(400).json({
        success: false,
        message: 'No selected repository found. Please choose a repository first.',
      });
    }

    const githubToken = getDecryptedGitHubToken(req.user);
    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token not found. Please connect your GitHub account.',
      });
    }

    const { owner, repo, baseBranch, featureBranch } = user.selectedRepository;

    const baseContent = await githubService.fetchFileContent(
      githubToken,
      owner,
      repo,
      filePath,
      baseBranch
    );
    const featureContent = await githubService.fetchFileContent(
      githubToken,
      owner,
      repo,
      filePath,
      featureBranch
    );

    res.json({
      success: true,
      filePath,
      baseBranch,
      featureBranch,
      baseContent,
      featureContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get repository metadata
 * @route   GET /api/github/repo/:owner/:repo
 * @access  Private
 */
const getRepositoryMetadata = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const githubToken = getDecryptedGitHubToken(req.user);

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token not found. Please connect your GitHub account.',
      });
    }

    const repoData = await githubService.fetchRepositoryMetadata(githubToken, owner, repo);

    const metadata = {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      visibility: repoData.private ? 'private' : 'public',
      url: repoData.html_url,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      language: repoData.language,
      topics: repoData.topics,
      lastUpdated: repoData.updated_at,
      createdAt: repoData.created_at,
      defaultBranch: repoData.default_branch,
      isPrivate: repoData.private,
    };

    res.json({
      success: true,
      metadata,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Select and store repository configuration
 * @route   POST /api/github/select-repo
 * @access  Private
 */
const selectRepository = async (req, res) => {
  try {
    const { owner, repo, baseBranch, featureBranch, aiMonitoring } = req.body;

    if (!owner || !repo || !baseBranch || !featureBranch) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: owner, repo, baseBranch, featureBranch',
      });
    }

    const githubToken = getDecryptedGitHubToken(req.user);

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token not found. Please connect your GitHub account.',
      });
    }

    // Verify repository exists
    try {
      await githubService.fetchRepositoryMetadata(githubToken, owner, repo);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Repository not found or not accessible: ${owner}/${repo}`,
      });
    }

    // Update user with selected repository configuration
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        selectedRepository: {
          owner,
          repo,
          fullName: `${owner}/${repo}`,
          baseBranch,
          featureBranch,
          aiMonitoring: aiMonitoring || false,
          selectedAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Repository configuration saved successfully',
      selectedRepository: updatedUser.selectedRepository,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get selected repository configuration
 * @route   GET /api/github/selected-repo
 * @access  Private
 */
const getSelectedRepository = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.selectedRepository) {
      return res.status(404).json({
        success: false,
        message: 'No repository selected',
      });
    }

    res.json({
      success: true,
      selectedRepository: user.selectedRepository,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Toggle AI monitoring for selected repository
 * @route   POST /api/github/toggle-monitoring
 * @access  Private
 */
const toggleAIMonitoring = async (req, res) => {
  try {
    const { aiMonitoring } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.selectedRepository) {
      return res.status(400).json({
        success: false,
        message: 'No repository selected',
      });
    }

    user.selectedRepository.aiMonitoring = aiMonitoring;
    await user.save();

    res.json({
      success: true,
      message: `AI monitoring ${aiMonitoring ? 'enabled' : 'disabled'}`,
      aiMonitoring: user.selectedRepository.aiMonitoring,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserRepositories,
  getRepositoryBranches,
  getFileContents,
  getRepositoryMetadata,
  selectRepository,
  getSelectedRepository,
  toggleAIMonitoring,
};
