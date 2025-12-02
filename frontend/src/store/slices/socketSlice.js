import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socket: null,
  isConnected: false,
  timeLeft: null,
  studentName: null,
  hasAnswered: false,
  kickedOut: false,
  chatMessages: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    setStudentName: (state, action) => {
      state.studentName = action.payload;
    },
    setHasAnswered: (state, action) => {
      state.hasAnswered = action.payload;
    },
    setKickedOut: (state, action) => {
      state.kickedOut = action.payload;
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload || [];
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    resetSocket: (state) => {
      state.socket = null;
      state.isConnected = false;
      state.timeLeft = null;
      state.hasAnswered = false;
      state.kickedOut = false;
      state.chatMessages = [];
    },
  },
});

export const { 
  setSocket, 
  setConnected, 
  setTimeLeft, 
  setStudentName,
  setHasAnswered,
  setKickedOut,
  setChatMessages,
  addChatMessage,
  clearChatMessages,
  resetSocket 
} = socketSlice.actions;
export default socketSlice.reducer;
