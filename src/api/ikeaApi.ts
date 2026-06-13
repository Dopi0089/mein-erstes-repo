import axios from 'axios';
import type { Device, DeviceState, IkeaConfig, ISmartHomeProvider } from '@/types';

export class IkeaApi implements ISmartHomeProvider {
  readonly platform = 'ikea' as const;
  private config: IkeaConfig | null = null;

  configure(config: IkeaConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(this.config?.hubIp && this.config?.accessToken);
  }

  private get client() {
    if (!this.config) throw new Error('IKEA not configured');
    return axios.create({
      baseURL: `https://${this.config.hubIp}:8443/v1`,
      timeout: 10000,
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
      httpsAgent: { rejectUnauthorized: false },
    });
  }

  async fetchDevices(): Promise<Device[]> {
    const { data } = await this.client.get('/devices');
    return (data as any[])
      .filter((d) => d.type !== 'gateway')
      .map((d) => ({
        id: `ikea_${d.id}`,
        platformId: d.id,
        platform: 'ikea' as const,
        type: resolveIkeaType(d),
        name: d.attributes?.customName ?? d.attributes?.model ?? 'IKEA Device',
        room: d.room?.name,
        isOnline: d.isReachable ?? true,
        capabilities: resolveIkeaCapabilities(d),
        state: {
          on: d.attributes?.isOn ?? false,
          brightness: d.attributes?.lightLevel != null
            ? Math.round((d.attributes.lightLevel / 100) * 100)
            : undefined,
          colorTemp: d.attributes?.colorTemperature,
        },
        lastUpdated: new Date(),
      }));
  }

  async setState(deviceId: string, state: Partial<DeviceState>): Promise<void> {
    const platformId = deviceId.replace('ikea_', '');
    const attributes: Record<string, unknown> = {};
    if (state.on !== undefined) attributes.isOn = state.on;
    if (state.brightness !== undefined) attributes.lightLevel = state.brightness;
    if (state.colorTemp !== undefined) attributes.colorTemperature = state.colorTemp;
    await this.client.patch(`/devices/${platformId}`, [{ attributes }]);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/hub');
      return true;
    } catch {
      return false;
    }
  }
}

function resolveIkeaType(d: any): Device['type'] {
  const t = d.type?.toLowerCase() ?? '';
  if (t.includes('light') || t.includes('bulb')) return 'light';
  if (t.includes('sensor') || t.includes('motion')) return 'sensor';
  if (t.includes('outlet') || t.includes('plug')) return 'plug';
  return 'switch';
}

function resolveIkeaCapabilities(d: any): Device['capabilities'] {
  const caps: Device['capabilities'] = ['on_off'];
  if (d.attributes?.lightLevel != null) caps.push('brightness');
  if (d.attributes?.colorTemperature != null) caps.push('color_temp');
  return caps;
}

export const ikeaApi = new IkeaApi();
