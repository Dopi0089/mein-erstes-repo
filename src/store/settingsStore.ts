import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlatformSettings, HueConfig, ShellyConfig, IkeaConfig, TuyaConfig, EufyConfig } from '@/types';

const STORAGE_KEY = 'smarthome_settings';

interface SettingsState {
  settings: PlatformSettings;
  isLoaded: boolean;
  load: () => Promise<void>;
  saveHue: (config: HueConfig) => Promise<void>;
  saveShelly: (config: ShellyConfig) => Promise<void>;
  saveIkea: (config: IkeaConfig) => Promise<void>;
  saveTuya: (config: TuyaConfig) => Promise<void>;
  saveEufy: (config: EufyConfig) => Promise<void>;
  clearPlatform: (platform: keyof PlatformSettings) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ settings: JSON.parse(raw), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveHue: async (config) => {
    const settings = { ...get().settings, hue: config };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  saveShelly: async (config) => {
    const settings = { ...get().settings, shelly: config };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  saveIkea: async (config) => {
    const settings = { ...get().settings, ikea: config };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  saveTuya: async (config) => {
    const settings = { ...get().settings, tuya: config };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  saveEufy: async (config) => {
    const settings = { ...get().settings, eufy: config };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },

  clearPlatform: async (platform) => {
    const settings = { ...get().settings };
    delete settings[platform];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set({ settings });
  },
}));
