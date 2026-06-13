import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useSettingsStore } from '@/store/settingsStore';
import { startBackgroundSync } from '@/services/deviceManager';
import { registerForPushNotifications } from '@/services/notificationService';

export default function App() {
  const { load, isLoaded } = useSettingsStore();

  useEffect(() => {
    load().then(() => {
      startBackgroundSync(30_000);
    });
    registerForPushNotifications();
  }, []);

  if (!isLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
