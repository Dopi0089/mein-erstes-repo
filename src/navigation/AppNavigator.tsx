import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAutomationStore } from '../store/automationStore';

import { DashboardScreen } from '../screens/DashboardScreen';
import { DevicesScreen } from '../screens/DevicesScreen';
import { AutomationsScreen } from '../screens/AutomationsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { HueSettingsScreen } from '../screens/settings/HueSettingsScreen';
import { ShellySettingsScreen } from '../screens/settings/ShellySettingsScreen';
import { IkeaSettingsScreen } from '../screens/settings/IkeaSettingsScreen';
import { TuyaSettingsScreen } from '../screens/settings/TuyaSettingsScreen';
import { EufySettingsScreen } from '../screens/settings/EufySettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Einstellungen' }} />
      <Stack.Screen name="HueSettings" component={HueSettingsScreen} options={{ title: 'Philips Hue' }} />
      <Stack.Screen name="ShellySettings" component={ShellySettingsScreen} options={{ title: 'Shelly' }} />
      <Stack.Screen name="IkeaSettings" component={IkeaSettingsScreen} options={{ title: 'IKEA Home Smart' }} />
      <Stack.Screen name="TuyaSettings" component={TuyaSettingsScreen} options={{ title: 'Tuya / Smart Life' }} />
      <Stack.Screen name="EufySettings" component={EufySettingsScreen} options={{ title: 'Eufy' }} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const unreadCount = useAutomationStore((s) => s.unreadCount);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Dashboard: 'home',
              Geräte: 'hardware-chip',
              Automationen: 'flash',
              Benachrichtigungen: 'notifications',
              Einstellungen: 'settings',
            };
            return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Geräte" component={DevicesScreen} />
        <Tab.Screen name="Automationen" component={AutomationsScreen} />
        <Tab.Screen
          name="Benachrichtigungen"
          component={NotificationsScreen}
          options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
        />
        <Tab.Screen name="Einstellungen" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
