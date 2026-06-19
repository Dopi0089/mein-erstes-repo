import { create } from 'zustand';
import type { Device, DeviceState, Platform } from '../types';

interface DeviceStore {
  devices: Device[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  setDevices: (devices: Device[]) => void;
  updateDevice: (id: string, state: Partial<DeviceState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getByPlatform: (platform: Platform) => Device[];
  getByRoom: (room: string) => Device[];
  getRooms: () => string[];
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  loading: false,
  error: null,
  lastSync: null,

  setDevices: (devices) => set({ devices, lastSync: new Date(), error: null }),

  updateDevice: (id, state) =>
    set((store) => ({
      devices: store.devices.map((d) =>
        d.id === id ? { ...d, state: { ...d.state, ...state }, lastUpdated: new Date() } : d
      ),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getByPlatform: (platform) => get().devices.filter((d) => d.platform === platform),

  getByRoom: (room) => get().devices.filter((d) => d.room === room),

  getRooms: () => {
    const rooms = get()
      .devices.map((d) => d.room)
      .filter((r): r is string => !!r);
    return [...new Set(rooms)].sort();
  },
}));
