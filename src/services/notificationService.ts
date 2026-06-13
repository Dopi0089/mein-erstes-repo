import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAutomationStore } from '@/store/automationStore';
import type { Platform as SmartPlatform, NotificationEvent } from '@/types';

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await ExpoNotifications.setNotificationChannelAsync('smart-home', {
      name: 'Smart Home',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = await ExpoNotifications.getExpoPushTokenAsync();
  return token.data;
}

export async function sendLocalNotification(
  title: string,
  body: string,
  platform: SmartPlatform,
  deviceId: string
) {
  await ExpoNotifications.scheduleNotificationAsync({
    content: { title, body, data: { platform, deviceId } },
    trigger: null,
  });

  const event: NotificationEvent = {
    id: `notif_${Date.now()}`,
    title,
    body,
    platform,
    deviceId,
    timestamp: new Date(),
    read: false,
  };

  await useAutomationStore.getState().addNotification(event);
}
