import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useDeviceStore } from '../store/deviceStore';

export function ConnectionStatus() {
  const { loading, error, lastSync } = useDeviceStore();

  if (loading) {
    return (
      <View style={styles.bar}>
        <View style={[styles.dot, { backgroundColor: colors.warning }]} />
        <Text style={styles.text}>Synchronisiere...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.bar}>
        <View style={[styles.dot, { backgroundColor: colors.error }]} />
        <Text style={styles.text}>Verbindungsfehler</Text>
      </View>
    );
  }

  if (!lastSync) return null;

  return (
    <View style={styles.bar}>
      <View style={[styles.dot, { backgroundColor: colors.success }]} />
      <Text style={styles.text}>
        Zuletzt: {lastSync.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: typography.caption,
});
