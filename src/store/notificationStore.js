import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (message, type = 'info') => set((state) => ({
    notifications: [{ id: Date.now(), message, type, read: false, time: new Date().toLocaleTimeString() }, ...state.notifications].slice(0, 50)
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
