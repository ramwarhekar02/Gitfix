const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { runAiMerge } = require('../services/aiService');

// Parse cookie string into key-value pairs
const parseCookies = (cookieString) => {
  const list = {};
  if (!cookieString) return list;

  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
};

const conflictSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      const token = cookies.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to websocket: ${socket.user.username} (${socket.id})`);
    // Debug: note whether cookie was present on handshake (helpful for intermittent auth issues)
    if (process.env.DEBUG_SOCKETS === 'true') {
      console.log('Socket handshake cookies present:', !!socket.handshake.headers.cookie);
    }

    socket.on('send_conflict', async (data) => {
      const { baseCode, branchA, branchB } = data;

      try {
        // 1. Started
        socket.emit('analysis_started', { message: 'Initializing resolution workspace...' });
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 2. Parsing
        socket.emit('parsing', { message: 'Analyzing syntax and merge boundaries...' });
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Create a pending Analysis database entry
        const analysis = await Analysis.create({
          userId: socket.user._id,
          baseCode: baseCode || '',
          branchA: branchA || '',
          branchB: branchB || '',
          status: 'pending',
        });

        // 3. AI Processing
        socket.emit('ai_processing', { message: 'Prompting AI engine for resolution...' });
        const result = await runAiMerge(baseCode || '', branchA || '', branchB || '');

        // 4. Risk Analysis
        socket.emit('risk_check', { message: 'Evaluating merge conflicts and regression risk...' });
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Save results to DB
        analysis.mergedCode = result.mergedCode;
        analysis.riskScore = result.risk;
        analysis.explanation = result.reason;
        await analysis.save();

        // 5. Done
        socket.emit('result_ready', {
          success: true,
          analysis: {
            _id: analysis._id,
            baseCode: analysis.baseCode,
            branchA: analysis.branchA,
            branchB: analysis.branchB,
            mergedCode: analysis.mergedCode,
            riskScore: analysis.riskScore,
            explanation: analysis.explanation,
            status: analysis.status,
            createdAt: analysis.createdAt,
          },
        });
      } catch (error) {
        console.error('Socket processing error:', error);
        socket.emit('error', { message: 'Resolution failed: ' + error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      const username = socket.user ? socket.user.username : 'unknown';
      console.log(`User disconnected: ${username} (reason: ${reason})`);
    });
  });
};

module.exports = conflictSocket;
