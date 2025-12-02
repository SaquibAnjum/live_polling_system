import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import { initializeSocket } from './socketHandlers/socketHandler.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const hasSecureSecret = process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key';
const hasSecureTeacherPassword = process.env.TEACHER_PASSWORD && process.env.TEACHER_PASSWORD !== 'teacher123';

if (isProduction && (!hasSecureSecret || !hasSecureTeacherPassword)) {
  console.error('❌ Missing secure JWT_SECRET or TEACHER_PASSWORD in production. Set these env vars to continue.');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intervue-polling')
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Running in in-memory mode (no persistence)');
});

// Initialize Socket.IO
initializeSocket(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
});
