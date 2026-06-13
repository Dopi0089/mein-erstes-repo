import axios from 'axios';
import type { Device, DeviceState, EufyConfig, ISmartHomeProvider } from '@/types';

const BASE_URL = 'https://mysecurity.eufylife.com/api/v1';

export class EufyApi implements ISmartHomeProvider {
  readonly platform = 'eufy' as const;
  private config: EufyConfig | null = null;
  private authToken: string | null = null;

  configure(config: EufyConfig) {
    this.config = config;
    this.authToken = null;
  }

  isConfigured(): boolean {
    return !!(this.config?.email && this.config?.password);
  }

  private async ensureAuth(): Promise<void> {
    if (this.authToken) return;
    const { data } = await axios.post(`${BASE_URL}/passport/login`, {
      email: this.config!.email,
      password: this.config!.password,
      ab_code: 'de',
    }, { headers: { 'Content-Type': 'application/json' } });
    this.authToken = data.data?.auth_token ?? null;
    if (!this.authToken) throw new Error('Eufy login failed');
  }

  private get headers() {
    return { Authorization: `Bearer ${this.authToken}` };
  }

  async fetchDevices(): Promise<Device[]> {
    await this.ensureAuth();
    const { data } = await axios.post(
      `${BASE_URL}/app/get_devs_list`,
      {},
      { headers: this.headers }
    );
    const devices: any[] = data.data?.device_list ?? [];
    return devices.map((d) => ({
      id: `eufy_${d.device_sn}`,
      platformId: d.device_sn,
      platform: 'eufy' as const,
      type: resolveEufyType(d.device_type),
      name: d.device_name,
      room: undefined,
      isOnline: d.status === 1,
      capabilities: resolveEufyCapabilities(d.device_type),
      state: { on: d.device_params?.switch_mode === 1 ?? false },
      lastUpdated: new Date(),
    }));
  }

  async setState(deviceId: string, state: Partial<DeviceState>): Promise<void> {
    await this.ensureAuth();
    const sn = deviceId.replace('eufy_', '');
    await axios.post(
      `${BASE_URL}/app/upload_devs_params`,
      { device_sn: sn, station_sn: sn, params: [{ param_type: 2015, param_value: state.on ? 1 : 0 }] },
      { headers: this.headers }
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.ensureAuth();
      return !!this.authToken;
    } catch {
      return false;
    }
  }
}

function resolveEufyType(deviceType: number): Device['type'] {
  if ([1, 2, 3].includes(deviceType)) return 'camera';
  if (deviceType === 7) return 'sensor';
  return 'switch';
}

function resolveEufyCapabilities(deviceType: number): Device['capabilities'] {
  if ([1, 2, 3].includes(deviceType)) return ['motion'];
  return ['on_off'];
}

export const eufyApi = new EufyApi();
