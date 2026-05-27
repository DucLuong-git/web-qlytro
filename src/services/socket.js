import { io } from 'socket.io-client';

// We connect to the backend server. If in dev mode, it might be localhost:3001, but Vite proxies /api.
// Socket.io doesn't strictly go through Vite proxy easily if we use default options, so we connect directly
// to the backend url, or if in prod, it's the same host.
const SOCKET_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3001' : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
});
