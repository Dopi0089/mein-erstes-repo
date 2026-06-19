import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settingsStore';
import { startBackgroundSync } from './src/services/deviceManager';
import { registerForPushNotifications } from './src/services/notificationService';

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
