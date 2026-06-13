import { hueApi } from '@/api/hueApi';
import { shellyApi } from '@/api/shellyApi';
import { ikeaApi } from '@/api/ikeaApi';
import { tuyaApi } from '@/api/tuyaApi';
import { eufyApi } from '@/api/eufyApi';
import { useSettingsStore } from '@/store/settingsStore';
import { useDeviceStore } from '@/store/deviceStore';
import type { ISmartHomeProvider } from '@/types';

const providers: ISmartHomeProvider[] = [hueApi, shellyApi, ikeaApi, tuyaApi, eufyApi];

export function configureProviders() {
  const { settings } = useSettingsStore.getState();
  if (settings.hue) hueApi.configure(settings.hue);
  if (settings.shelly) shellyApi.configure(settings.shelly);
  if (settings.ikea) ikeaApi.configure(settings.ikea);
  if (settings.tuya) tuyaApi.configure(settings.tuya);
  if (settings.eufy) eufyApi.configure(settings.eufy);
}

export async function syncAllDevices(): Promise<void> {
  const store = useDeviceStore.getState();
  store.setLoading(true);

  configureProviders();

  const results = await Promise.allSettled(
    providers.filter((p) => p.isConfigured()).map((p) => p.fetchDevices())
  );

  const allDevices = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof hueApi.fetchDevices>>> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  store.setDevices(allDevices);
  store.setLoading(false);
}

export async function setDeviceState(deviceId: string, state: Parameters<ISmartHomeProvider['setState']>[1]): Promise<void> {
  const provider = providers.find((p) => deviceId.startsWith(p.platform));
  if (!provider) throw new Error(`No provider for device ${deviceId}`);
  await provider.setState(deviceId, state);
  useDeviceStore.getState().updateDevice(deviceId, state);
}

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startBackgroundSync(intervalMs = 30_000) {
  stopBackgroundSync();
  syncAllDevices();
  syncInterval = setInterval(syncAllDevices, intervalMs);
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
