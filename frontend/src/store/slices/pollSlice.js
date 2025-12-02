import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  currentQuestion: null,
  results: null,
  participants: [],
  pollHistory: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload;
    },
    clearPoll: (state) => {
      state.currentPoll = null;
      state.currentQuestion = null;
      state.results = null;
      state.participants = [];
    },
  },
});

export const { 
  setCurrentPoll, 
  setCurrentQuestion, 
  setResults, 
  setParticipants,
  setPollHistory,
  clearPoll 
} = pollSlice.actions;
export default pollSlice.reducer;


