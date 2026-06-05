const axios = require('axios');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Joi = require('joi');
const { OAuth2Client } = require('google-auth-library');

// Check if client ID is configured (will log warning if not, but won't crash server start)
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here';
const client = new OAuth2Client(googleClientId);

// Registration schema validation
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

// Login schema validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          selectedRepository: user.selectedRepository || null,
          githubProfile: user.githubProfile || null,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          selectedRepository: user.selectedRepository || null,
          githubProfile: user.githubProfile || null,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatarUrl: user.avatarUrl,
          selectedRepository: user.selectedRepository || null,
          githubProfile: user.githubProfile || null,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential token is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create user. Generate a clean username
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'googleuser';
      let username = baseUsername;
      let usernameExists = await User.findOne({ username });
      let counter = 1;
      while (usernameExists) {
        username = `${baseUsername}${counter}`;
        usernameExists = await User.findOne({ username });
        counter++;
      }

      user = await User.create({
        username,
        email,
      });
    }

    generateToken(res, user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        selectedRepository: user.selectedRepository || null,
        githubProfile: user.githubProfile || null,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(400).json({ success: false, message: 'Invalid Google credential token' });
  }
};

// @desc    GitHub OAuth redirect endpoint - send user to GitHub auth page
// @route   GET /api/auth/github/login
// @access  Public
const githubLoginRedirect = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send('GitHub client ID is not configured');
    }

    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;
    const scope = 'repo user:email';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&allow_signup=true`;

    return res.redirect(authUrl);
  } catch (error) {
    console.error('GitHub Login Redirect Error:', error.message || error);
    return res.status(500).send('GitHub login redirect failed');
  }
};

// @desc    GitHub OAuth callback - exchange code and store token
// @route   GET /api/auth/github/callback
// @access  Public
const githubOAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('Missing code from GitHub');
    }

    // Build redirect_uri dynamically to match the one used in the authorize step
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      console.error('GitHub token exchange failed', tokenResponse.data);
      return res.status(400).send('GitHub token exchange failed');
    }

    // Fetch GitHub profile
    const profileRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const profile = profileRes.data;

    // Try to fetch user's primary email (may be private)
    let primaryEmail = null;
    try {
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      const emails = emailsRes.data || [];
      const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified);
      if (primary) primaryEmail = primary.email;
    } catch (e) {
      // ignore if emails are not accessible
    }

    // If user is already authenticated via cookie, attach token to that account
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
      if (!user) return res.status(404).send('User not found');
    } else {
      // Try to find existing user by GitHub id or email
      user = await User.findOne({ 'githubProfile.id': profile.id });
      if (!user && primaryEmail) {
        user = await User.findOne({ email: primaryEmail });
      }

      // If no user found, create a new user account
      if (!user) {
        let baseUsername = profile.login ? profile.login.toLowerCase().replace(/[^a-z0-9]/g, '') : 'githubuser';
        let username = baseUsername;
        let usernameExists = await User.findOne({ username });
        let counter = 1;
        while (usernameExists) {
          username = `${baseUsername}${counter}`;
          usernameExists = await User.findOne({ username });
          counter++;
        }

        // Provide a fallback email if GitHub did not return one
        const fallbackEmail = primaryEmail || profile.email || `${profile.id}+github@users.noreply.github.com`;

        user = await User.create({
          username,
          email: fallbackEmail,
          avatarUrl: profile.avatar_url || undefined,
        });
      }
    }

    // set JWT cookie for all GitHub callback users, including existing accounts
    generateToken(res, user._id);

    // Attach GitHub token and profile to the user
    user.setGitHubToken(accessToken);
    user.githubProfile = {
      id: profile.id,
      login: profile.login,
      avatar_url: profile.avatar_url,
      profile_url: profile.html_url,
      email: primaryEmail || undefined,
    };

    await user.save();

    // Redirect back to frontend repo manager
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/repo-manager?github=connected`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error.message || error);
    return res.status(500).send('GitHub OAuth failed');
  }
};

// Profile update validation schema
const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'any.required': 'Username is required',
  }),
  phoneNumber: Joi.string().allow('').max(20).messages({
    'string.max': 'Phone number cannot exceed 20 characters',
  }),
  avatarUrl: Joi.string().allow('').messages({}),
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, phoneNumber, avatarUrl } = req.body;

    // Check if username is taken by another user
    const usernameTaken = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (usernameTaken) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.username = username;
    user.phoneNumber = phoneNumber || '';
    user.avatarUrl = avatarUrl || '';

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
