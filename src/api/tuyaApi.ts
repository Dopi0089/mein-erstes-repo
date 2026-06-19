import axios from 'axios';
import * as Crypto from 'expo-crypto';
import type { Device, DeviceState, TuyaConfig, ISmartHomeProvider } from '../types';

const REGION_HOSTS: Record<string, string> = {
  eu: 'https://openapi.tuyaeu.com',
  us: 'https://openapi.tuyaus.com',
  cn: 'https://openapi.tuyacn.com',
  in: 'https://openapi.tuyain.com',
};

export class TuyaApi implements ISmartHomeProvider {
  readonly platform = 'tuya' as const;
  private config: TuyaConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  configure(config: TuyaConfig) {
    this.config = config;
    this.accessToken = null;
  }

  isConfigured(): boolean {
    return !!(this.config?.clientId && this.config?.clientSecret);
  }

  private get baseUrl() {
    return REGION_HOSTS[this.config?.region ?? 'eu'];
  }

  private async sign(method: string, path: string, body: string, token: string): Promise<{ sign: string; t: string }> {
    const t = Date.now().toString();
    const { clientId, clientSecret } = this.config!;
    const contentHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      body,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    const stringToSign = [method, contentHash, '', path].join('\n');
    const signStr = clientId + token + t + stringToSign;
    const sign = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      clientSecret + signStr,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return { sign: sign.toUpperCase(), t };
  }

  private async ensureToken(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return;
    const path = '/v1.0/token?grant_type=1';
    const { sign, t } = await this.sign('GET', path, '', '');
    const { data } = await axios.get(`${this.baseUrl}${path}`, {
      headers: {
        client_id: this.config!.clientId,
        sign,
        t,
        sign_method: 'HMAC-SHA256',
      },
    });
    this.accessToken = data.result.access_token;
    this.tokenExpiry = Date.now() + data.result.expire_time * 1000 - 60000;
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: object): Promise<T> {
    await this.ensureToken();
    const bodyStr = body ? JSON.stringify(body) : '';
    const { sign, t } = await this.sign(method, path, bodyStr, this.accessToken!);
    const { data } = await axios.request({
      method,
      url: `${this.baseUrl}${path}`,
      data: body,
      headers: {
        client_id: this.config!.clientId,
        access_token: this.accessToken!,
        sign,
        t,
        sign_method: 'HMAC-SHA256',
        'Content-Type': 'application/json',
      },
    });
    return data.result;
  }

  async fetchDevices(): Promise<Device[]> {
    const result: any = await this.request('GET', '/v1.0/iot-03/devices');
    const devices: any[] = result?.devices ?? result?.list ?? [];
    return devices.map((d) => ({
      id: `tuya_${d.id}`,
      platformId: d.id,
      platform: 'tuya' as const,
      type: resolveTuyaType(d.category),
      name: d.name,
      room: d.room_name,
      isOnline: d.online ?? true,
      capabilities: ['on_off'],
      state: { on: d.status?.find((s: any) => s.code === 'switch')?.value ?? false },
      lastUpdated: new Date(),
    }));
  }

  async setState(deviceId: string, state: Partial<DeviceState>): Promise<void> {
    const platformId = deviceId.replace('tuya_', '');
    const commands: Array<{ code: string; value: unknown }> = [];
    if (state.on !== undefined) commands.push({ code: 'switch', value: state.on });
    if (state.brightness !== undefined) commands.push({ code: 'bright_value', value: Math.round((state.brightness / 100) * 1000) });
    await this.request('POST', `/v1.0/iot-03/devices/${platformId}/commands`, { commands });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.ensureToken();
      return !!this.accessToken;
    } catch {
      return false;
    }
  }
}

function resolveTuyaType(category: string): Device['type'] {
  const map: Record<string, Device['type']> = {
    dj: 'light', dd: 'light', fwl: 'light',
    kg: 'switch', cz: 'plug', pc: 'plug',
    wk: 'thermostat', mcs: 'sensor', pir: 'sensor',
    sp: 'camera',
  };
  return map[category] ?? 'switch';
}

export const tuyaApi = new TuyaApi();
