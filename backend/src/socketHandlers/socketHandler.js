import jwt from 'jsonwebtoken';
import Poll from '../models/Poll.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for active questions and timers (fallback if DB fails)
const activeQuestions = new Map();
const studentAnswers = new Map(); // questionId -> Set of socketIds who answered

function clearActiveQuestionTimer(questionId) {
  const timer = activeQuestions.get(questionId);
  if (timer) {
    clearInterval(timer);
    activeQuestions.delete(questionId);
  }
}

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Student joins a poll
    socket.on('student_join', async (data) => {
      try {
        const { pollId, name, tabId } = data;
        
        if (!pollId || !name) {
          socket.emit('error', { message: 'PollId and name are required' });
          return;
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        // Check for duplicate names in the same poll
        let finalName = name;
        const existingNames = poll.sessions.map(s => s.name);
        let nameCount = 1;
        while (existingNames.includes(finalName)) {
          finalName = `${name} (${nameCount})`;
          nameCount++;
        }

        // Join the poll room
        const roomName = `poll_${pollId}`;
        socket.join(roomName);
        socket.data.pollId = pollId;
        socket.data.name = finalName;
        socket.data.role = 'student';
        socket.data.tabId = tabId || socket.id;

        // Add to sessions
        poll.sessions.push({
          socketId: socket.id,
          name: finalName,
          tabId: socket.data.tabId
        });
        await poll.save();

        // Notify student of their assigned name (if changed)
        if (finalName !== name) {
          socket.emit('name_assigned', { name: finalName });
        }

        // Broadcast updated participant list to teacher
        io.to(roomName).emit('participants_update', {
          participants: poll.sessions.map(s => ({
            socketId: s.socketId,
            name: s.name
          }))
        });

        // If there's an active question, send it to the new student
        if (poll.isQuestionActive && poll.currentQuestionId) {
          const currentQuestion = poll.questions.find(
            q => q.questionId === poll.currentQuestionId
          );
          if (currentQuestion) {
            const timeLeft = Math.max(0, 
              currentQuestion.timeLimit - 
              Math.floor((Date.now() - currentQuestion.startedAt) / 1000)
            );
            socket.emit('question_started', {
              questionId: currentQuestion.questionId,
              pollId,
              questionText: currentQuestion.text,
              options: currentQuestion.options.map(opt => opt.text),
              timeLimit: currentQuestion.timeLimit,
              startAt: currentQuestion.startedAt,
              timeLeft
            });
          }
        }

        console.log(`👤 Student ${finalName} joined poll ${pollId}`);
      } catch (error) {
        console.error('Error in student_join:', error);
        socket.emit('error', { message: 'Failed to join poll' });
      }
    });

    // Teacher starts a question
    socket.on('start_question', async (data) => {
      try {
        const authData = authTeacher(socket, data);
        if (!authData) return;
        const { pollId, question } = authData;
        if (!pollId || !question) return;

        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        // Prevent overlapping questions; require explicit end
        if (poll.isQuestionActive && poll.currentQuestionId) {
          socket.emit('error', { 
            message: 'Cannot start a new question until the current one is ended.' 
          });
          return;
        }

        // Clear any stale timer for the previous question
        if (poll.currentQuestionId) {
          clearActiveQuestionTimer(poll.currentQuestionId);
        }

        // Create new question
        const questionId = uuidv4();
        const newQuestion = {
          questionId,
          text: question.text,
          options: question.options.map(opt => ({
            text: opt.text,
            votes: 0,
            isCorrect: !!opt.isCorrect
          })),
          timeLimit: question.timeLimit || 60,
          startedAt: new Date(),
          endedAt: null,
          resultsSaved: false,
          studentAnswers: []
        };

        poll.questions.push(newQuestion);
        poll.currentQuestionId = questionId;
        poll.isQuestionActive = true;
        await poll.save();

        // Reset answer tracking for this question
        studentAnswers.set(questionId, new Set());

        // Broadcast question to all in room
        const roomName = `poll_${pollId}`;
        io.to(roomName).emit('question_started', {
          questionId,
          pollId,
          questionText: newQuestion.text,
          options: newQuestion.options.map(opt => opt.text),
          timeLimit: newQuestion.timeLimit,
          startAt: newQuestion.startedAt
        });

        // Start timer
        startQuestionTimer(io, pollId, questionId, newQuestion.timeLimit, poll);

        console.log(`❓ Teacher started question ${questionId} in poll ${pollId}`);
      } catch (error) {
        console.error('Error in start_question:', error);
        socket.emit('error', { message: 'Failed to start question' });
      }
    });

    // Teacher ends the current question explicitly
    socket.on('end_question', async (data) => {
      try {
        const authData = authTeacher(socket, data);
        if (!authData) return;
        const { pollId } = authData;

        if (!pollId) {
          socket.emit('error', { message: 'PollId is required' });
          return;
        }

        const poll = await Poll.findById(pollId);
        if (!poll || !poll.isQuestionActive || !poll.currentQuestionId) {
          socket.emit('error', { message: 'No active question to end' });
          return;
        }

        const question = poll.questions.find(q => q.questionId === poll.currentQuestionId);
        if (!question) {
          socket.emit('error', { message: 'Question not found' });
          return;
        }

        if (question.endedAt) {
          socket.emit('error', { message: 'Question already ended' });
          return;
        }

        question.endedAt = new Date();
        question.resultsSaved = true;
        poll.isQuestionActive = false;
        await poll.save();

        clearActiveQuestionTimer(question.questionId);

        const total = question.studentAnswers.length;
        const finalCounts = {};
        const finalPercentages = {};

        question.options.forEach((opt, idx) => {
          finalCounts[idx] = opt.votes;
          finalPercentages[idx] = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        });

        const roomName = `poll_${pollId}`;
        io.to(roomName).emit('question_ended', {
          counts: finalCounts,
          percentages: finalPercentages,
          total
        });

        console.log(`🛑 Teacher ended question ${question.questionId} in poll ${pollId}`);
      } catch (error) {
        console.error('Error in end_question:', error);
        socket.emit('error', { message: 'Failed to end question' });
      }
    });

    // Student submits answer
    socket.on('submit_answer', async (data) => {
      try {
        const { pollId, questionId, optionIndex, studentName } = data;
        
        if (!pollId || !questionId || optionIndex === undefined) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        const question = poll.questions.find(q => q.questionId === questionId);
        if (!question) {
          socket.emit('error', { message: 'Question not found' });
          return;
        }

        // Check if question is still active
        if (!poll.isQuestionActive || poll.currentQuestionId !== questionId) {
          socket.emit('error', { message: 'Question is not active' });
          return;
        }

        // Check if student already answered (enforce single answer)
        const session = poll.sessions.find(s => s.socketId === socket.id);
        const tabId = socket.data.tabId || session?.tabId || data.tabId || socket.id;
        const hasAnswered = question.studentAnswers.some(
          ans => ans.socketId === socket.id || ans.tabId === tabId
        );

        if (hasAnswered) {
          socket.emit('error', { message: 'You have already submitted an answer' });
          return;
        }

        // Validate option index
        if (optionIndex < 0 || optionIndex >= question.options.length) {
          socket.emit('error', { message: 'Invalid option index' });
          return;
        }

        // Record answer
        question.options[optionIndex].votes++;
        question.studentAnswers.push({
          socketId: socket.id,
          studentName: socket.data.name || studentName,
          tabId,
          optionIndex,
          submittedAt: new Date()
        });

        // Mark results as saved when first answer is submitted
        if (question.studentAnswers.length === 1) {
          question.resultsSaved = true;
        }

        await poll.save();

        // Calculate and broadcast results
        const total = question.studentAnswers.length;
        const counts = {};
        const percentages = {};

        question.options.forEach((opt, idx) => {
          counts[idx] = opt.votes;
          percentages[idx] = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        });

        const roomName = `poll_${pollId}`;
        io.to(roomName).emit('result_update', {
          counts,
          total,
          percentages
        });

        // Send correctness feedback to this student only
        const correctOption = question.options.find(opt => opt.isCorrect);
        const isCorrect = question.options[optionIndex]?.isCorrect || false;
        socket.emit('answer_feedback', {
          questionId,
          isCorrect,
          correctAnswer: correctOption ? correctOption.text : null
        });

        console.log(`✅ ${socket.data.name || studentName} answered question ${questionId}`);
      } catch (error) {
        console.error('Error in submit_answer:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Chat message
    socket.on('chat_message', async (data) => {
      try {
        const { pollId, message, sender, role } = data;
        const roomName = `poll_${pollId}`;
        
        // Save message to database
        const poll = await Poll.findById(pollId);
        if (poll) {
          if (!poll.chatMessages) {
            poll.chatMessages = [];
          }
          poll.chatMessages.push({
            message,
            sender,
            role,
            timestamp: new Date()
          });
          await poll.save();
          console.log(`💬 Chat message saved: ${sender}: ${message.substring(0, 50)}...`);
        } else {
          console.error('❌ Poll not found for chat message:', pollId);
        }
        
        // Broadcast message to all in room
        io.to(roomName).emit('chat_message', {
          message,
          sender,
          role,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error in chat_message:', error);
      }
    });

    // Teacher joins poll room
    socket.on('teacher_join', async (data) => {
      try {
        const authData = authTeacher(socket, data);
        if (!authData) return;

        const { pollId } = data;
        if (!pollId) {
          socket.emit('error', { message: 'PollId is required' });
          return;
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        const roomName = `poll_${pollId}`;
        socket.join(roomName);
        socket.data.pollId = pollId;
        socket.data.role = 'teacher';

        // Send current participants
        socket.emit('participants_update', {
          participants: poll.sessions.map(s => ({
            socketId: s.socketId,
            name: s.name
          }))
        });

        console.log(`👨‍🏫 Teacher joined poll ${pollId}`);
      } catch (error) {
        console.error('Error in teacher_join:', error);
        socket.emit('error', { message: 'Failed to join poll' });
      }
    });

    // Teacher kicks a student
    socket.on('kick_student', async (data) => {
      try {
        const authData = authTeacher(socket, data);
        if (!authData) return;
        const { pollId, socketId: targetSocketId } = authData;
        if (!pollId || !targetSocketId) return;

        const poll = await Poll.findById(pollId);
        if (!poll) {
          socket.emit('error', { message: 'Poll not found' });
          return;
        }

        // Remove from sessions
        poll.sessions = poll.sessions.filter(s => s.socketId !== targetSocketId);
        await poll.save();

        // Disconnect the student
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('kicked_out', { message: 'You have been removed from the poll' });
          targetSocket.disconnect();
        }

        // Broadcast updated participant list
        const roomName = `poll_${pollId}`;
        io.to(roomName).emit('participants_update', {
          participants: poll.sessions.map(s => ({
            socketId: s.socketId,
            name: s.name
          }))
        });

        console.log(`🚫 Teacher kicked student ${targetSocketId} from poll ${pollId}`);
      } catch (error) {
        console.error('Error in kick_student:', error);
        socket.emit('error', { message: 'Failed to kick student' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const pollId = socket.data.pollId;
        if (pollId) {
          const poll = await Poll.findById(pollId);
          if (poll) {
            // Remove from sessions
            poll.sessions = poll.sessions.filter(s => s.socketId !== socket.id);
            await poll.save();

            // Broadcast updated participant list
            const roomName = `poll_${pollId}`;
            io.to(roomName).emit('participants_update', {
              participants: poll.sessions.map(s => ({
                socketId: s.socketId,
                name: s.name
              }))
            });
          }
        }
        console.log(`❌ Client disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}

// Helper function to authenticate teacher
function authTeacher(socket, data) {
  const token = socket.handshake.auth.token;
  if (!token) {
    socket.emit('error', { message: 'No token provided' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'teacher') {
      socket.emit('error', { message: 'Not authorized' });
      return null;
    }
    socket.data.role = 'teacher';
    return data;
  } catch (err) {
    socket.emit('error', { message: 'Invalid token' });
    return null;
  }
}

// Start timer for a question
function startQuestionTimer(io, pollId, questionId, timeLimit, poll) {
  const roomName = `poll_${pollId}`;
  let secondsLeft = timeLimit;

  const timerInterval = setInterval(async () => {
    secondsLeft--;

    // Emit time left every second
    io.to(roomName).emit('time_left', { secondsLeft });

    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      activeQuestions.delete(questionId);
      
      // End question
      try {
        const updatedPoll = await Poll.findById(pollId);
        if (!updatedPoll) return;

        const question = updatedPoll.questions.find(q => q.questionId === questionId);
        if (!question) return;
        if (question.endedAt) return;

        question.endedAt = new Date();
        question.resultsSaved = true; // Mark results as saved
        updatedPoll.isQuestionActive = false;
        await updatedPoll.save();

        // Calculate final results
        const total = question.studentAnswers.length;
        const finalCounts = {};
        const finalPercentages = {};

        question.options.forEach((opt, idx) => {
          finalCounts[idx] = opt.votes;
          finalPercentages[idx] = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        });

        // Broadcast question ended
        io.to(roomName).emit('question_ended', {
          counts: finalCounts,
          percentages: finalPercentages,
          total
        });

        console.log(`⏰ Question ${questionId} ended (timeout)`);
      } catch (error) {
        console.error('Error ending question:', error);
      }
    }
  }, 1000);

  // Store timer reference (for cleanup if needed)
  activeQuestions.set(questionId, timerInterval);
}
