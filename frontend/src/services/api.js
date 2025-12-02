import axios from 'axios';

// Default to backend port 3000; override via VITE_API_URL if needed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacherToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  teacherLogin: async (password) => {
    const response = await api.post('/api/auth/teacher/login', { password });
    return response.data;
  },
};

export const pollAPI = {
  createPoll: async (pollData) => {
    const response = await api.post('/api/polls', pollData);
    return response.data;
  },
  getPoll: async (pollId) => {
    const response = await api.get(`/api/polls/${pollId}`);
    return response.data;
  },
};

export default api;
