import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography } from '@/theme';
import type { Platform } from '@/types';

const LABELS: Record<Platform, string> = {
  hue: 'Hue',
  shelly: 'Shelly',
  ikea: 'IKEA',
  tuya: 'Tuya',
  eufy: 'Eufy',
};

interface Props {
  platform: Platform;
}

export function PlatformBadge({ platform }: Props) {
  const color = colors.platforms[platform];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '66' }]}>
      <Text style={[styles.label, { color }]}>{LABELS[platform]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
