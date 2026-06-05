const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Fetch GitHub user profile data
 * @param {string} token - GitHub OAuth access token
 */
const fetchGitHubProfile = async (token) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub profile: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch all repositories for the authenticated user
 * @param {string} token - GitHub OAuth access token
 * @param {number} page - Pagination page
 * @param {number} perPage - Items per page (max 100)
 */
const fetchUserRepositories = async (token, page = 1, perPage = 30) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/user/repos`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch branches for a specific repository
 * @param {string} token - GitHub OAuth access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
const fetchRepositoryBranches = async (token, owner, repo) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          per_page: 100,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch branches: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch repository metadata
 * @param {string} token - GitHub OAuth access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 */
const fetchRepositoryMetadata = async (token, owner, repo) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repository metadata: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch pull requests for a repository
 * @param {string} token - GitHub OAuth access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} state - PR state: 'open', 'closed', 'all'
 */
const fetchPullRequests = async (token, owner, repo, state = 'open') => {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          state,
          per_page: 50,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch pull requests: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetch file contents from a GitHub repository branch
 * @param {string} token - GitHub OAuth access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path in repo
 * @param {string} ref - Branch or commit ref
 */
const fetchFileContent = async (token, owner, repo, path, ref) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${encodeURI(path)}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          ref,
        },
      }
    );

    if (Array.isArray(response.data)) {
      throw new Error('The requested path is a directory, not a file.');
    }

    const content = Buffer.from(response.data.content || '', 'base64').toString('utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to fetch file content: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Parse repository name from URL or slug
 * @param {string} repoString - Repository string (owner/repo or full URL)
 */
const parseRepository = (repoString) => {
  if (repoString.includes('/')) {
    const parts = repoString.split('/');
    const repo = parts[parts.length - 1].replace('.git', '');
    const owner = parts[parts.length - 2];
    return { owner, repo };
  }
  throw new Error('Invalid repository format. Expected: owner/repo');
};

module.exports = {
  fetchGitHubProfile,
  fetchUserRepositories,
  fetchRepositoryBranches,
  fetchRepositoryMetadata,
  fetchPullRequests,
  fetchFileContent,
  parseRepository,
};
