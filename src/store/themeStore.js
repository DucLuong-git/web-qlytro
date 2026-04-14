import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('theme') === 'dark',
  initTheme: () => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  },
  toggleTheme: () => set((state) => {
    const isDark = !state.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    return { darkMode: isDark };
  })
}));
