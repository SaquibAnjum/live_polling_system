import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  text: { type: String, required: true },
  options: [optionSchema],
  timeLimit: { type: Number, default: 60 },
  startedAt: { type: Date },
  endedAt: { type: Date },
  resultsSaved: { type: Boolean, default: false },
  studentAnswers: [{
    socketId: String,
    studentName: String,
    tabId: String,
    optionIndex: Number,
    submittedAt: Date
  }]
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  tabId: { type: String }
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sender: { type: String, required: true },
  role: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  questions: [questionSchema],
  sessions: [sessionSchema],
  currentQuestionId: { type: String, default: null },
  isQuestionActive: { type: Boolean, default: false },
  chatMessages: [chatMessageSchema]
}, {
  timestamps: true
});

export default mongoose.models.Poll || mongoose.model('Poll', pollSchema);
