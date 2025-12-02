import { io } from 'socket.io-client';

// Default to backend port 3000; override via VITE_SOCKET_URL if needed
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const createSocket = (token = null) => {
  return io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });
};
