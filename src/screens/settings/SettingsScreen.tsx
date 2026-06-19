import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';

const PLATFORMS = [
  { key: 'hue', label: 'Philips Hue', icon: 'bulb', screen: 'HueSettings', color: colors.platforms.hue },
  { key: 'shelly', label: 'Shelly', icon: 'flash', screen: 'ShellySettings', color: colors.platforms.shelly },
  { key: 'ikea', label: 'IKEA Home Smart', icon: 'home', screen: 'IkeaSettings', color: colors.platforms.ikea },
  { key: 'tuya', label: 'Tuya / Smart Life', icon: 'cloud', screen: 'TuyaSettings', color: colors.platforms.tuya },
  { key: 'eufy', label: 'Eufy', icon: 'videocam', screen: 'EufySettings', color: colors.platforms.eufy },
] as const;

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { settings } = useSettingsStore();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Einstellungen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Plattformen verbinden</Text>

        {PLATFORMS.map((p) => {
          const configured = !!settings[p.key as keyof typeof settings];
          return (
            <TouchableOpacity
              key={p.key}
              style={styles.row}
              onPress={() => navigation.navigate(p.screen)}
            >
              <View style={[styles.iconWrap, { backgroundColor: p.color + '22' }]}>
                <Ionicons name={p.icon as any} size={22} color={p.color} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{p.label}</Text>
                <Text style={[styles.rowStatus, { color: configured ? colors.success : colors.textMuted }]}>
                  {configured ? 'Verbunden' : 'Nicht konfiguriert'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { ...typography.h1 },
  content: { padding: spacing.md },
  section: { ...typography.label, marginBottom: spacing.sm, marginTop: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { ...typography.body, fontWeight: '600' },
  rowStatus: { ...typography.bodySmall, marginTop: 2 },
});
