import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { AutomationCard } from '../components/AutomationCard';
import { useAutomationStore } from '../store/automationStore';
import { buildTimeAutomationId } from '../services/automationService';
import { useDeviceStore } from '../store/deviceStore';
import type { Automation } from '../types';

export function AutomationsScreen() {
  const { automations, loadAutomations, addAutomation, deleteAutomation } = useAutomationStore();
  const { devices } = useDeviceStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [time, setTime] = useState('22:00');
  const [selectedDevice, setSelectedDevice] = useState('');

  useEffect(() => {
    loadAutomations();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert('Name fehlt'); return; }
    if (!selectedDevice) { Alert.alert('Gerät fehlt'); return; }

    const auto: Automation = {
      id: buildTimeAutomationId(),
      name: name.trim(),
      enabled: true,
      trigger: { type: 'time', time },
      actions: [{ deviceId: selectedDevice, state: { on: false } }],
    };
    await addAutomation(auto);
    setModalVisible(false);
    setName('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Automation löschen?', undefined, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => deleteAutomation(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Automationen</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {automations.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Keine Automationen</Text>
            <Text style={styles.emptyBody}>Tippe auf + um eine neue Automation zu erstellen.</Text>
          </View>
        )}
        {automations.map((auto) => (
          <AutomationCard key={auto.id} automation={auto} onDelete={handleDelete} />
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Neue Automation</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="z.B. Licht um 22 Uhr aus"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Uhrzeit</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="22:00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.fieldLabel}>Gerät (ausschalten)</Text>
            <ScrollView style={styles.devicePicker} nestedScrollEnabled>
              {devices.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.deviceOption, selectedDevice === d.id && styles.deviceOptionActive]}
                  onPress={() => setSelectedDevice(d.id)}
                >
                  <Text style={styles.deviceOptionText}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    width: 36, height: 36, borderRadius: borderRadius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptyBody: { ...typography.bodySmall, textAlign: 'center', maxWidth: 280 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, padding: spacing.lg,
  },
  modalTitle: { ...typography.h2, marginBottom: spacing.lg },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.md },
  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, color: colors.textPrimary,
    padding: spacing.md, ...typography.body,
  },
  devicePicker: { maxHeight: 150, marginTop: spacing.xs },
  deviceOption: {
    padding: spacing.sm, borderRadius: borderRadius.sm,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs,
  },
  deviceOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  deviceOptionText: { ...typography.body },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: {
    flex: 1, padding: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  cancelText: { ...typography.body, color: colors.textSecondary },
  saveBtn: {
    flex: 1, padding: spacing.md, borderRadius: borderRadius.md,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  saveText: { ...typography.body, fontWeight: '600' },
});
