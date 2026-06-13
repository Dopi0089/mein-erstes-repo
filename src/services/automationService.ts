import type { Automation, Device } from '@/types';
import { setDeviceState } from './deviceManager';

export async function evaluateAutomations(
  automations: Automation[],
  devices: Device[]
): Promise<string[]> {
  const triggered: string[] = [];

  for (const auto of automations) {
    if (!auto.enabled) continue;
    if (checkTrigger(auto, devices)) {
      triggered.push(auto.id);
      for (const action of auto.actions) {
        if (action.delay) await delay(action.delay);
        await setDeviceState(action.deviceId, action.state);
      }
    }
  }

  return triggered;
}

function checkTrigger(auto: Automation, devices: Device[]): boolean {
  const { trigger } = auto;

  if (trigger.type === 'time') {
    const now = new Date();
    const [h, m] = (trigger.time ?? '').split(':').map(Number);
    return now.getHours() === h && now.getMinutes() === m;
  }

  if (trigger.type === 'device_state' && trigger.deviceId && trigger.deviceState) {
    const device = devices.find((d) => d.id === trigger.deviceId);
    if (!device) return false;
    return Object.entries(trigger.deviceState).every(
      ([key, val]) => (device.state as Record<string, unknown>)[key] === val
    );
  }

  return false;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function buildTimeAutomationId(): string {
  return `auto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
