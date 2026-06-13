import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';
import { RoomGroup } from '@/components/RoomGroup';
import { DeviceCard } from '@/components/DeviceCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useDeviceStore } from '@/store/deviceStore';
import { syncAllDevices } from '@/services/deviceManager';
import type { Device } from '@/types';

export function DashboardScreen() {
  const { devices, loading, getRooms } = useDeviceStore();
  const rooms = getRooms();
  const noRoomDevices = devices.filter((d) => !d.room);

  const onlineCount = devices.filter((d) => d.isOnline).length;
  const activeCount = devices.filter((d) => d.state.on).length;

  useEffect(() => {
    syncAllDevices();
  }, []);

  const devicesByRoom = rooms.reduce<Record<string, Device[]>>((acc, room) => {
    acc[room] = devices.filter((d) => d.room === room);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Smart Home</Text>
          <Text style={styles.subtitle}>
            {onlineCount} online · {activeCount} aktiv
          </Text>
        </View>
        <TouchableOpacity onPress={syncAllDevices} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ConnectionStatus />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={syncAllDevices} tintColor={colors.primary} />}
      >
        {devices.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Keine Geräte gefunden</Text>
            <Text style={styles.emptyBody}>
              Gehe zu Einstellungen und verbinde deine Smart-Home-Plattformen.
            </Text>
          </View>
        )}

        {rooms.map((room) => (
          <RoomGroup key={room} room={room} devices={devicesByRoom[room]} />
        ))}

        {noRoomDevices.length > 0 && (
          <RoomGroup key="__no_room" room="Sonstige Geräte" devices={noRoomDevices} />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySmall, marginTop: 2 },
  refreshBtn: { padding: spacing.sm },
  content: { padding: spacing.md, paddingTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptyBody: { ...typography.bodySmall, textAlign: 'center', maxWidth: 280 },
});
