import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/teacher/login
router.post('/teacher/login', (req, res) => {
  const { password } = req.body;
  const teacherPassword = process.env.TEACHER_PASSWORD || '12345678';
  console.log('Teacher login attempt with password:', password);
  console.log('Expected teacher password:', teacherPassword); 

  if (password === teacherPassword) {
    const token = jwt.sign(
      { role: 'teacher' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

export default router;


