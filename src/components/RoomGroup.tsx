import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';
import { DeviceCard } from './DeviceCard';
import type { Device } from '@/types';

interface Props {
  room: string;
  devices: Device[];
}

export function RoomGroup({ room, devices }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const onlineCount = devices.filter((d) => d.isOnline).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setCollapsed((c) => !c)}>
        <View style={styles.titleRow}>
          <Text style={styles.room}>{room}</Text>
          <Text style={styles.count}>{onlineCount}/{devices.length}</Text>
        </View>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {!collapsed && (
        <View style={styles.grid}>
          {devices.map((device, i) => (
            <View key={device.id} style={[styles.cell, i % 2 === 0 && styles.cellLeft]}>
              <DeviceCard device={device} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  room: { ...typography.h3 },
  count: { ...typography.bodySmall },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
  cellLeft: {},
});
