const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptGitHubToken, decryptGitHubToken } = require('../utils/githubTokenCrypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubToken: {
      type: String,
      trim: true,
      default: '',
      select: false,
    },
    githubProfile: {
      id: Number,
      login: String,
      avatar_url: String,
      profile_url: String,
    },
    selectedRepository: {
      owner: String,
      repo: String,
      fullName: String,
      baseBranch: String,
      featureBranch: String,
      aiMonitoring: {
        type: Boolean,
        default: false,
      },
      selectedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.setGitHubToken = function (token) {
  this.githubToken = token ? encryptGitHubToken(token) : '';
};

userSchema.methods.getGitHubToken = function () {
  if (!this.githubToken) return '';

  try {
    return decryptGitHubToken(this.githubToken);
  } catch (error) {
    return this.githubToken;
  }
};

module.exports = mongoose.model('User', userSchema);
