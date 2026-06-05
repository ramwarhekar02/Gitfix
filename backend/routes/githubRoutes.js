const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserRepositories,
  getRepositoryBranches,
  getFileContents,
  getRepositoryMetadata,
  selectRepository,
  getSelectedRepository,
  toggleAIMonitoring,
} = require('../controllers/githubController');

// Protect all routes with authentication middleware
router.use(protect);

// Get user's repositories
router.get('/repos', getUserRepositories);

// Load repository file contents from selected branches
router.get('/file-contents', getFileContents);

// Get repository branches
router.get('/branches/:owner/:repo', getRepositoryBranches);

// Get repository metadata
router.get('/repo/:owner/:repo', getRepositoryMetadata);

// Select repository configuration
router.post('/select-repo', selectRepository);

// Get selected repository
router.get('/selected-repo', getSelectedRepository);

// Toggle AI monitoring
router.post('/toggle-monitoring', toggleAIMonitoring);

module.exports = router;
