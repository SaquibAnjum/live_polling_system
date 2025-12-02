import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teacherToken: localStorage.getItem('teacherToken') || null,
  isAuthenticated: !!localStorage.getItem('teacherToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTeacherToken: (state, action) => {
      state.teacherToken = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('teacherToken', action.payload);
      } else {
        localStorage.removeItem('teacherToken');
      }
    },
    logout: (state) => {
      state.teacherToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('teacherToken');
    },
  },
});

export const { setTeacherToken, logout } = authSlice.actions;
export default authSlice.reducer;


