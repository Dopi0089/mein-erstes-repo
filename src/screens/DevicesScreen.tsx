import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { DeviceCard } from '@/components/DeviceCard';
import { useDeviceStore } from '@/store/deviceStore';
import type { Platform, DeviceType } from '@/types';

type Filter = 'all' | Platform | DeviceType;

const PLATFORM_FILTERS: Array<{ key: Platform | 'all'; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'hue', label: 'Hue' },
  { key: 'shelly', label: 'Shelly' },
  { key: 'ikea', label: 'IKEA' },
  { key: 'tuya', label: 'Tuya' },
  { key: 'eufy', label: 'Eufy' },
];

export function DevicesScreen() {
  const { devices } = useDeviceStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered =
    filter === 'all'
      ? devices
      : devices.filter((d) => d.platform === filter || d.type === filter);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Geräte</Text>
        <Text style={styles.count}>{filtered.length} Geräte</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {PLATFORM_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.grid}>
        {filtered.map((device, i) => (
          <View key={device.id} style={[styles.cell, i % 2 === 0 && styles.cellLeft]}>
            <DeviceCard device={device} />
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Keine Geräte</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { ...typography.h1 },
  count: { ...typography.bodySmall },
  filterBar: { flexGrow: 0, paddingVertical: spacing.sm },
  filterContent: { paddingHorizontal: spacing.md, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { ...typography.label, color: colors.textSecondary },
  filterLabelActive: { color: colors.textPrimary },
  grid: { padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
  cellLeft: {},
  empty: { flex: 1, alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { ...typography.bodySmall },
});
