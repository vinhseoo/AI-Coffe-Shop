import { create } from 'zustand';
import { ShopSettings } from '../types/api';

interface SettingsStore {
  settings: ShopSettings | null;
  isLoaded: boolean;
  setSettings: (settings: ShopSettings) => void;
  clearSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  settings: null,
  isLoaded: false,

  setSettings: (settings) => set({ settings, isLoaded: true }),
  clearSettings: () => set({ settings: null, isLoaded: false }),
}));
