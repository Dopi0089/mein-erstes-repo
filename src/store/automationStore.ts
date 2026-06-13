import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Automation, NotificationEvent } from '@/types';

const AUTOMATIONS_KEY = 'smarthome_automations';
const NOTIFICATIONS_KEY = 'smarthome_notifications';

interface AutomationStore {
  automations: Automation[];
  notifications: NotificationEvent[];
  unreadCount: number;
  loadAutomations: () => Promise<void>;
  addAutomation: (automation: Automation) => Promise<void>;
  updateAutomation: (id: string, updates: Partial<Automation>) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
  addNotification: (event: NotificationEvent) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  automations: [],
  notifications: [],
  unreadCount: 0,

  loadAutomations: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTOMATIONS_KEY);
      if (raw) set({ automations: JSON.parse(raw) });
    } catch {}
  },

  addAutomation: async (automation) => {
    const automations = [...get().automations, automation];
    await AsyncStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));
    set({ automations });
  },

  updateAutomation: async (id, updates) => {
    const automations = get().automations.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    await AsyncStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));
    set({ automations });
  },

  deleteAutomation: async (id) => {
    const automations = get().automations.filter((a) => a.id !== id);
    await AsyncStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));
    set({ automations });
  },

  toggleAutomation: async (id) => {
    const automations = get().automations.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    await AsyncStorage.setItem(AUTOMATIONS_KEY, JSON.stringify(automations));
    set({ automations });
  },

  loadNotifications: async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (raw) {
        const notifications: NotificationEvent[] = JSON.parse(raw);
        set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
      }
    } catch {}
  },

  addNotification: async (event) => {
    const notifications = [event, ...get().notifications].slice(0, 100);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  },

  markAllRead: async () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    set({ notifications, unreadCount: 0 });
  },
}));
