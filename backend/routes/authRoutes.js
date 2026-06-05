const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleLogin,
  githubLoginRedirect,
  updateProfile,
  githubOAuthCallback,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/google', googleLogin);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.get('/github/login', githubLoginRedirect);
router.get('/github/callback', githubOAuthCallback);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

module.exports = router;
