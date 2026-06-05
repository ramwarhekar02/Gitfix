require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const conflictRoutes = require('./routes/conflictRoutes');
const historyRoutes = require('./routes/historyRoutes');
const mergeRoutes = require('./routes/mergeRoutes');
const githubRoutes = require('./routes/githubRoutes');
const conflictSocket = require('./socket/conflictSocket');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Pass Socket.IO server to socket handler
conflictSocket(io);

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Prevent sensitive data exposure
app.use((req, res, next) => {
  // Hide server info
  res.removeHeader('X-Powered-By');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Body and cookie parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/conflict', conflictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/merge', mergeRoutes);
app.use('/api/github', githubRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Only log detailed errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error Stack:', err.stack);
  } else {
    // In production, log minimal info for debugging
    console.error('Error occurred:', err.message);
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
