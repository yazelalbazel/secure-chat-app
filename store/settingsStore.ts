import { create } from 'zustand';

interface SettingsStore {
  darkMode: boolean;
  notifications: boolean;
  e2eEncryption: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleE2EEncryption: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  darkMode: false,
  notifications: true,
  e2eEncryption: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
  toggleE2EEncryption: () => set((state) => ({ e2eEncryption: !state.e2eEncryption })),
}));