import express from 'express';
import jwt from 'jsonwebtoken';
import Poll from '../models/Poll.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to verify teacher token
const verifyTeacher = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    req.teacher = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/polls - Create a new poll
router.post('/', verifyTeacher, async (req, res) => {
  try {
    const { title, options, timeLimit } = req.body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 options are required' });
    }

    const poll = new Poll({
      title,
      questions: [],
      sessions: [],
      currentQuestionId: null,
      isQuestionActive: false
    });

    await poll.save();

    res.json({
      pollId: poll._id.toString(),
      pollData: poll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// GET /api/polls/:pollId - Get poll details
router.get('/:pollId', verifyTeacher, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

export default router;

