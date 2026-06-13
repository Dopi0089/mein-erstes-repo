import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { PlatformBadge } from './PlatformBadge';
import { setDeviceState } from '@/services/deviceManager';
import type { Device } from '@/types';

const TYPE_ICONS: Record<Device['type'], keyof typeof Ionicons.glyphMap> = {
  light: 'bulb',
  switch: 'toggle',
  sensor: 'radio',
  camera: 'videocam',
  thermostat: 'thermometer',
  plug: 'flash',
};

interface Props {
  device: Device;
}

export function DeviceCard({ device }: Props) {
  const [busy, setBusy] = useState(false);

  const togglePower = async () => {
    if (busy || !device.capabilities.includes('on_off')) return;
    setBusy(true);
    try {
      await setDeviceState(device.id, { on: !device.state.on });
    } finally {
      setBusy(false);
    }
  };

  const icon = TYPE_ICONS[device.type] ?? 'hardware-chip';
  const isOn = device.state.on;
  const iconColor = isOn ? colors.deviceTypes[device.type] : colors.textMuted;

  return (
    <TouchableOpacity
      style={[styles.card, isOn && styles.cardOn]}
      onPress={togglePower}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '22' }]}>
          {busy ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Ionicons name={icon} size={22} color={iconColor} />
          )}
        </View>
        <View style={styles.statusDot}>
          <View style={[styles.dot, { backgroundColor: device.isOnline ? colors.success : colors.error }]} />
        </View>
      </View>

      <Text style={styles.name} numberOfLines={2}>{device.name}</Text>

      {device.state.brightness != null && (
        <Text style={styles.detail}>{device.state.brightness}% Helligkeit</Text>
      )}
      {device.state.temperature != null && (
        <Text style={styles.detail}>{device.state.temperature.toFixed(1)}°C</Text>
      )}
      {device.state.power != null && (
        <Text style={styles.detail}>{device.state.power.toFixed(1)} W</Text>
      )}

      <View style={styles.footer}>
        <PlatformBadge platform={device.platform} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardOn: {
    borderColor: colors.primary + '66',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: { padding: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { ...typography.body, fontWeight: '600', marginTop: spacing.sm, flex: 1 },
  detail: { ...typography.bodySmall, marginTop: 2 },
  footer: { marginTop: spacing.sm, flexDirection: 'row' },
});
