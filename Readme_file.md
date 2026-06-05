# GitHub Integration Setup Guide

## 🔧 Quick Start

### 1. Backend Environment Variables (.env)
```env
# Existing variables
MONGO_URI=mongodb://localhost:27017/gitfix
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# New GitHub configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

### 2. Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

---

## 🔐 GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name:** GitFix
   - **Homepage URL:** http://localhost:5173 (dev) or your production URL
   - **Authorization callback URL:** http://localhost:5000/api/auth/github/callback
4. Copy `Client ID` and `Client Secret`

### Step 2: Backend Implementation (Optional - for full OAuth)
Create new endpoint: `backend/controllers/authController.js` -> `githubOAuth`

```javascript
const githubOAuth = async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for access token
  const response = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  }, {
    headers: { Accept: 'application/json' },
  });
  
  const token = response.data.access_token;
  
  // Get user profile
  const userProfile = await axios.get('https://api.github.com/user', {
    headers: { Authorization: `token ${token}` },
  });
  
  // Store token and profile in user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      githubToken: token,
      githubProfile: {
        id: userProfile.data.id,
        login: userProfile.data.login,
        avatar_url: userProfile.data.avatar_url,
        profile_url: userProfile.data.html_url,
      },
    },
    { new: true }
  );
  
  res.json({ success: true, user });
};
```

### Step 3: Frontend Button (in Header or RepoManager)
```jsx
const handleGitHubLogin = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/api/auth/github/callback`
  );
  window.location.href = 
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
};
```

---

## 📱 API Usage Examples

### Fetch Repositories
```javascript
// Frontend
const { repositories, fetchRepositories } = useAuth();

useEffect(() => {
  fetchRepositories();
}, []);
```

### Select Repository
```javascript
const handleSelectRepo = async (repo) => {
  const result = await selectRepo(
    repo.owner.login,
    repo.name,
    'main',
    'dev',
    true // AI Monitoring
  );
  
  if (result.success) {
    console.log('Repository selected:', result.selectedRepository);
  }
};
```

### Toggle AI Monitoring
```javascript
const handleToggleMonitoring = async () => {
  const result = await toggleAIMonitoring(!aiMonitoringEnabled);
  
  if (result.success) {
    setAiMonitoringEnabled(result.aiMonitoring);
  }
};
```

---

## 🧪 Testing Checklist

- [ ] GitHub repositories load successfully
- [ ] Repository list shows correct data (visibility, stars, language)
- [ ] Branches fetch correctly when repository is selected
- [ ] Base branch and feature branch can be selected
- [ ] Configuration saves without errors
- [ ] AI monitoring toggle works
- [ ] Dashboard shows repository status when configured
- [ ] Dashboard shows warning when no repository selected
- [ ] Navigation links work correctly
- [ ] All API errors handled gracefully

---

## 🐛 Troubleshooting

### "GitHub token not found" Error
- **Cause:** User hasn't authenticated with GitHub yet
- **Solution:** Implement GitHub OAuth flow (see Step 2 above)

### Repositories not loading
- **Cause:** GitHub API rate limit exceeded or invalid token
- **Solution:** Check token validity, wait for rate limit reset

### CORS Error
- **Cause:** Frontend and backend URLs don't match in GitHub OAuth settings
- **Solution:** Update GitHub OAuth app redirect URI

### "Repository not found or not accessible"
- **Cause:** Repository is private or user doesn't have access
- **Solution:** Verify repository exists and user has permission

---

## 📊 Database Schema Changes

### User Model
```javascript
{
  // Existing fields...
  githubToken: String,           // OAuth token
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
    aiMonitoring: Boolean,
    selectedAt: Date,
  },
}
```

---

## 🚀 Production Deployment

1. **Environment Variables**
   - Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in production
   - Update `GITHUB_REDIRECT_URI` to production URL
   - Set `NODE_ENV=production`

2. **HTTPS**
   - GitHub OAuth requires HTTPS in production
   - Update redirect URIs to use https://

3. **Rate Limiting**
   - GitHub API has rate limits (60 requests/hour unauthenticated, 5000 authenticated)
   - Consider implementing caching

4. **Security**
   - Never commit GitHub secrets to version control
   - Use environment variables for all sensitive data
   - Store tokens securely with encryption if needed

---

## 📚 API Documentation

See `IMPLEMENTATION_SUMMARY.md` for complete API endpoint documentation.

---

**Last Updated:** June 4, 2026  
**Status:** Ready for Production
