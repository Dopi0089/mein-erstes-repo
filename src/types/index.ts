export type Platform = 'hue' | 'shelly' | 'ikea' | 'tuya' | 'eufy';
export type DeviceType = 'light' | 'switch' | 'sensor' | 'camera' | 'thermostat' | 'plug';
export type Capability = 'on_off' | 'brightness' | 'color_temp' | 'color' | 'temperature' | 'motion' | 'power_monitoring';

export interface DeviceState {
  on: boolean;
  brightness?: number;
  colorTemp?: number;
  color?: { h: number; s: number; v: number };
  temperature?: number;
  motion?: boolean;
  power?: number;
}

export interface Device {
  id: string;
  platformId: string;
  platform: Platform;
  type: DeviceType;
  name: string;
  room?: string;
  isOnline: boolean;
  state: DeviceState;
  capabilities: Capability[];
  lastUpdated: Date;
}

export interface AutomationTrigger {
  type: 'time' | 'device_state' | 'sunrise' | 'sunset';
  time?: string;
  deviceId?: string;
  deviceState?: Partial<DeviceState>;
  offset?: number;
}

export interface AutomationAction {
  deviceId: string;
  state: Partial<DeviceState>;
  delay?: number;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
}

export interface NotificationEvent {
  id: string;
  title: string;
  body: string;
  platform: Platform;
  deviceId: string;
  timestamp: Date;
  read: boolean;
}

export interface HueConfig {
  bridgeIp: string;
  username: string;
}

export interface ShellyConfig {
  devices: Array<{ ip: string; name: string; generation: 1 | 2 }>;
  cloudToken?: string;
}

export interface IkeaConfig {
  hubIp: string;
  accessToken: string;
}

export interface TuyaConfig {
  clientId: string;
  clientSecret: string;
  region: 'eu' | 'us' | 'cn' | 'in';
}

export interface EufyConfig {
  email: string;
  password: string;
}

export interface PlatformSettings {
  hue?: HueConfig;
  shelly?: ShellyConfig;
  ikea?: IkeaConfig;
  tuya?: TuyaConfig;
  eufy?: EufyConfig;
}

export interface ISmartHomeProvider {
  platform: Platform;
  isConfigured(): boolean;
  fetchDevices(): Promise<Device[]>;
  setState(deviceId: string, state: Partial<DeviceState>): Promise<void>;
  testConnection(): Promise<boolean>;
}
