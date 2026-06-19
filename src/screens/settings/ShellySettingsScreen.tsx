import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { shellyApi } from '../../api/shellyApi';
import type { ShellyConfig } from '../../types';

export function ShellySettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveShelly, clearPlatform } = useSettingsStore();
  const [devices, setDevices] = useState<ShellyConfig['devices']>(settings.shelly?.devices ?? []);
  const [newIp, setNewIp] = useState('');
  const [newName, setNewName] = useState('');
  const [gen, setGen] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const addDevice = () => {
    if (!newIp || !newName) { Alert.alert('IP und Name erforderlich'); return; }
    setDevices([...devices, { ip: newIp, name: newName, generation: gen }]);
    setNewIp(''); setNewName('');
  };

  const removeDevice = (ip: string) => setDevices(devices.filter((d) => d.ip !== ip));

  const handleSave = async () => {
    if (!devices.length) { Alert.alert('Mindestens ein Gerät erforderlich'); return; }
    setSaving(true);
    shellyApi.configure({ devices });
    const ok = await shellyApi.testConnection();
    setSaving(false);
    if (!ok) { Alert.alert('Verbindung fehlgeschlagen', 'IP-Adresse des ersten Geräts prüfen.'); return; }
    await saveShelly({ devices });
    Alert.alert('Gespeichert', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Shelly</Text>
        <Text style={styles.subtitle}>Füge deine Shelly-Geräte über ihre lokale IP-Adresse hinzu.</Text>

        <Text style={styles.sectionLabel}>Neues Gerät</Text>
        <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Geräte-Name (z.B. Wohnzimmer)" placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} value={newIp} onChangeText={setNewIp} placeholder="IP-Adresse (192.168.1.x)" placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" />
        <View style={styles.genRow}>
          {([1, 2] as const).map((g) => (
            <TouchableOpacity key={g} style={[styles.genBtn, gen === g && styles.genBtnActive]} onPress={() => setGen(g)}>
              <Text style={[styles.genText, gen === g && styles.genTextActive]}>Gen {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addDevice}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addText}>Gerät hinzufügen</Text>
        </TouchableOpacity>

        {devices.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Konfigurierte Geräte</Text>
            {devices.map((d) => (
              <View key={d.ip} style={styles.deviceRow}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{d.name}</Text>
                  <Text style={styles.deviceIp}>{d.ip} · Gen {d.generation}</Text>
                </View>
                <TouchableOpacity onPress={() => removeDevice(d.ip)}>
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {settings.shelly && (
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => clearPlatform('shelly')}>
            <Text style={styles.disconnectText}>Verbindung trennen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Text style={styles.saveText}>Speichern</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  title: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm, marginTop: spacing.lg },
  input: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1,
    borderColor: colors.border, color: colors.textPrimary, padding: spacing.md,
    ...typography.body, marginBottom: spacing.sm,
  },
  genRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  genBtn: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  genBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  genText: { ...typography.label, color: colors.textSecondary },
  genTextActive: { color: colors.primary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm },
  addText: { ...typography.body, color: colors.primary },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  deviceInfo: { flex: 1 },
  deviceName: { ...typography.body, fontWeight: '600' },
  deviceIp: { ...typography.bodySmall },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveText: { ...typography.body, fontWeight: '600' },
  disconnectBtn: { borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginTop: spacing.md },
  disconnectText: { ...typography.body, color: colors.error },
});
