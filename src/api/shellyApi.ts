import { createHttpClient } from './baseApi';
import type { Device, DeviceState, ShellyConfig, ISmartHomeProvider } from '../types';

export class ShellyApi implements ISmartHomeProvider {
  readonly platform = 'shelly' as const;
  private config: ShellyConfig | null = null;

  configure(config: ShellyConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(this.config?.devices?.length);
  }

  async fetchDevices(): Promise<Device[]> {
    if (!this.config) return [];
    const results = await Promise.allSettled(
      this.config.devices.map((dev) => this.fetchSingleDevice(dev))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Device> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  private async fetchSingleDevice(dev: ShellyConfig['devices'][number]): Promise<Device> {
    const client = createHttpClient(`http://${dev.ip}`);

    if (dev.generation === 2) {
      const { data } = await client.post('/rpc/Switch.GetStatus', { id: 0 });
      return {
        id: `shelly_${dev.ip.replace(/\./g, '_')}`,
        platformId: dev.ip,
        platform: 'shelly',
        type: 'switch',
        name: dev.name,
        isOnline: true,
        capabilities: ['on_off', 'power_monitoring'],
        state: { on: data.output ?? false, power: data.apower },
        lastUpdated: new Date(),
      };
    }

    const { data } = await client.get('/status');
    return {
      id: `shelly_${dev.ip.replace(/\./g, '_')}`,
      platformId: dev.ip,
      platform: 'shelly',
      type: data.meters ? 'plug' : 'switch',
      name: dev.name,
      isOnline: data.wifi_sta?.connected ?? true,
      capabilities: data.meters ? ['on_off', 'power_monitoring'] : ['on_off'],
      state: {
        on: data.relays?.[0]?.ison ?? false,
        power: data.meters?.[0]?.power,
      },
      lastUpdated: new Date(),
    };
  }

  async setState(deviceId: string, state: Partial<DeviceState>): Promise<void> {
    const ip = deviceId.replace('shelly_', '').replace(/_/g, '.');
    const dev = this.config?.devices.find((d) => d.ip === ip);
    if (!dev) return;

    const client = createHttpClient(`http://${ip}`);
    if (dev.generation === 2) {
      await client.post('/rpc/Switch.Set', { id: 0, on: state.on });
    } else {
      await client.get(`/relay/0?turn=${state.on ? 'on' : 'off'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config?.devices?.length) return false;
    try {
      const first = this.config.devices[0];
      const client = createHttpClient(`http://${first.ip}`);
      await client.get('/shelly');
      return true;
    } catch {
      return false;
    }
  }
}

export const shellyApi = new ShellyApi();
