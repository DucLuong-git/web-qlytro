import { create } from 'zustand';

// Session expiry: 8 hours
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const sanitizeUser = (userData) => {
  // Remove password from stored user data
  const { password, ...safe } = userData;
  return safe;
};

const isSessionValid = () => {
  const expiry = localStorage.getItem('sessionExpiry');
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
};

const getStoredUser = () => {
  if (!isSessionValid()) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionExpiry');
    return null;
  }
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),

  login: (userData) => {
    const safeUser = sanitizeUser(userData);
    const expiry = Date.now() + SESSION_DURATION_MS;
    // Generate a pseudo-secure token with expiry embedded
    const token = btoa(`${safeUser.id}:${safeUser.role}:${expiry}`) + '.' + Math.random().toString(36).slice(2);
    localStorage.setItem('user', JSON.stringify(safeUser));
    localStorage.setItem('token', token);
    localStorage.setItem('sessionExpiry', String(expiry));
    set({ user: safeUser, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionExpiry');
    set({ user: null, isAuthenticated: false });
  },

  refreshSession: () => {
    if (!isSessionValid()) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionExpiry');
      set({ user: null, isAuthenticated: false });
      return false;
    }
    return true;
  }
}));
