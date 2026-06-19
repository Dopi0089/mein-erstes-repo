import { createHttpClient } from './baseApi';
import type { Device, DeviceState, HueConfig, ISmartHomeProvider } from '../types';

export class HueApi implements ISmartHomeProvider {
  readonly platform = 'hue' as const;
  private config: HueConfig | null = null;

  configure(config: HueConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(this.config?.bridgeIp && this.config?.username);
  }

  private get client() {
    if (!this.config) throw new Error('Hue not configured');
    return createHttpClient(`http://${this.config.bridgeIp}/api/${this.config.username}`);
  }

  async fetchDevices(): Promise<Device[]> {
    const { data } = await this.client.get('/lights');
    return Object.entries(data).map(([id, raw]: [string, any]) => ({
      id: `hue_${id}`,
      platformId: id,
      platform: 'hue' as const,
      type: raw.type?.toLowerCase().includes('color') ? 'light' : 'light',
      name: raw.name,
      room: undefined,
      isOnline: raw.state?.reachable ?? true,
      capabilities: resolveHueCapabilities(raw),
      state: {
        on: raw.state?.on ?? false,
        brightness: raw.state?.bri != null ? Math.round((raw.state.bri / 254) * 100) : undefined,
        colorTemp: raw.state?.ct != null ? miredToKelvin(raw.state.ct) : undefined,
        color: raw.state?.hue != null
          ? { h: Math.round((raw.state.hue / 65535) * 360), s: Math.round((raw.state.sat / 254) * 100), v: Math.round((raw.state.bri / 254) * 100) }
          : undefined,
      },
      lastUpdated: new Date(),
    }));
  }

  async setState(deviceId: string, state: Partial<DeviceState>): Promise<void> {
    const platformId = deviceId.replace('hue_', '');
    const body: Record<string, unknown> = {};
    if (state.on !== undefined) body.on = state.on;
    if (state.brightness !== undefined) body.bri = Math.round((state.brightness / 100) * 254);
    if (state.colorTemp !== undefined) body.ct = kelvinToMired(state.colorTemp);
    if (state.color !== undefined) {
      body.hue = Math.round((state.color.h / 360) * 65535);
      body.sat = Math.round((state.color.s / 100) * 254);
    }
    await this.client.put(`/lights/${platformId}/state`, body);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/lights');
      return true;
    } catch {
      return false;
    }
  }

  async discoverBridge(): Promise<string | null> {
    try {
      const { data } = await createHttpClient('https://discovery.meethue.com').get('/');
      return data?.[0]?.internalipaddress ?? null;
    } catch {
      return null;
    }
  }

  async registerApp(bridgeIp: string): Promise<string | null> {
    try {
      const client = createHttpClient(`http://${bridgeIp}`);
      const { data } = await client.post('/api', { devicetype: 'SmartHomeHub#app' });
      return data?.[0]?.success?.username ?? null;
    } catch {
      return null;
    }
  }
}

function resolveHueCapabilities(raw: any) {
  const caps: Device['capabilities'] = ['on_off'];
  if (raw.state?.bri != null) caps.push('brightness');
  if (raw.state?.ct != null) caps.push('color_temp');
  if (raw.state?.hue != null) caps.push('color');
  return caps;
}

function miredToKelvin(mired: number): number {
  return Math.round(1_000_000 / mired);
}

function kelvinToMired(kelvin: number): number {
  return Math.round(1_000_000 / kelvin);
}

export const hueApi = new HueApi();
