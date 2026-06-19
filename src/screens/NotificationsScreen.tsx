import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { PlatformBadge } from '../components/PlatformBadge';
import { useAutomationStore } from '../store/automationStore';

export function NotificationsScreen() {
  const { notifications, unreadCount, loadNotifications, markAllRead } = useAutomationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Benachrichtigungen</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Alle gelesen</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Keine Benachrichtigungen</Text>
            <Text style={styles.emptyBody}>Ereignisse von deinen Geräten erscheinen hier.</Text>
          </View>
        )}

        {notifications.map((n) => (
          <View key={n.id} style={[styles.card, !n.read && styles.cardUnread]}>
            <View style={styles.cardRow}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardBody}>{n.body}</Text>
                <View style={styles.cardMeta}>
                  <PlatformBadge platform={n.platform} />
                  <Text style={styles.timestamp}>
                    {new Date(n.timestamp).toLocaleString('de-DE', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
              {!n.read && <View style={styles.unreadDot} />}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  title: { ...typography.h1 },
  readAllBtn: { padding: spacing.sm },
  readAllText: { ...typography.label, color: colors.primary },
  content: { padding: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptyBody: { ...typography.bodySmall, textAlign: 'center', maxWidth: 280 },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  cardUnread: { borderColor: colors.primary + '55' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.body, fontWeight: '600' },
  cardBody: { ...typography.bodySmall, marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  timestamp: { ...typography.caption },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary, marginTop: 4,
  },
});
