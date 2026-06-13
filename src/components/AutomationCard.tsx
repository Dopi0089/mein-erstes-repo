import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { useAutomationStore } from '@/store/automationStore';
import type { Automation } from '@/types';

interface Props {
  automation: Automation;
  onDelete: (id: string) => void;
}

export function AutomationCard({ automation, onDelete }: Props) {
  const toggleAutomation = useAutomationStore((s) => s.toggleAutomation);

  const triggerLabel =
    automation.trigger.type === 'time'
      ? `Um ${automation.trigger.time} Uhr`
      : automation.trigger.type === 'sunrise'
      ? 'Bei Sonnenaufgang'
      : automation.trigger.type === 'sunset'
      ? 'Bei Sonnenuntergang'
      : 'Wenn Gerätestatus';

  return (
    <View style={[styles.card, !automation.enabled && styles.cardDisabled]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="flash" size={20} color={colors.warning} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{automation.name}</Text>
          <Text style={styles.trigger}>{triggerLabel}</Text>
          <Text style={styles.actions}>{automation.actions.length} Aktion(en)</Text>
        </View>
        <View style={styles.controls}>
          <Switch
            value={automation.enabled}
            onValueChange={() => toggleAutomation(automation.id)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
          <TouchableOpacity onPress={() => onDelete(automation.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardDisabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { ...typography.body, fontWeight: '600' },
  trigger: { ...typography.bodySmall, marginTop: 2 },
  actions: { ...typography.caption, marginTop: 2 },
  controls: { alignItems: 'center', gap: spacing.sm },
  deleteBtn: { padding: spacing.xs },
});
