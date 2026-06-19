import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { tuyaApi } from '../../api/tuyaApi';
import type { TuyaConfig } from '../../types';

const REGIONS: TuyaConfig['region'][] = ['eu', 'us', 'cn', 'in'];

export function TuyaSettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveTuya, clearPlatform } = useSettingsStore();
  const [clientId, setClientId] = useState(settings.tuya?.clientId ?? '');
  const [clientSecret, setClientSecret] = useState(settings.tuya?.clientSecret ?? '');
  const [region, setRegion] = useState<TuyaConfig['region']>(settings.tuya?.region ?? 'eu');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    tuyaApi.configure({ clientId, clientSecret, region });
    const ok = await tuyaApi.testConnection();
    setSaving(false);
    if (!ok) { Alert.alert('Verbindung fehlgeschlagen', 'Client-ID und Secret aus dem Tuya IoT-Portal prüfen.'); return; }
    await saveTuya({ clientId, clientSecret, region });
    Alert.alert('Gespeichert', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tuya / Smart Life</Text>
        <Text style={styles.subtitle}>Verbinde über das Tuya IoT-Entwicklerportal (iot.tuya.com).</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            1. Gehe zu iot.tuya.com{'\n'}
            2. Erstelle ein Projekt{'\n'}
            3. Kopiere Client-ID und Client-Secret{'\n'}
            4. Verknüpfe deine Smart-Life-App
          </Text>
        </View>

        <Text style={styles.label}>Client-ID</Text>
        <TextInput style={styles.input} value={clientId} onChangeText={setClientId} placeholder="Client ID" placeholderTextColor={colors.textMuted} autoCapitalize="none" />

        <Text style={styles.label}>Client-Secret</Text>
        <TextInput style={styles.input} value={clientSecret} onChangeText={setClientSecret} placeholder="Client Secret" placeholderTextColor={colors.textMuted} autoCapitalize="none" secureTextEntry />

        <Text style={styles.label}>Region</Text>
        <View style={styles.regionRow}>
          {REGIONS.map((r) => (
            <TouchableOpacity key={r} style={[styles.regionBtn, region === r && styles.regionBtnActive]} onPress={() => setRegion(r)}>
              <Text style={[styles.regionText, region === r && styles.regionTextActive]}>{r.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {settings.tuya && (
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => clearPlatform('tuya')}>
            <Text style={styles.disconnectText}>Verbindung trennen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Text style={styles.saveText}>Verbindung testen & speichern</Text>}
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
  infoBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoText: { ...typography.bodySmall, lineHeight: 22 },
  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.md, ...typography.body, marginBottom: spacing.sm },
  regionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  regionBtn: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  regionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  regionText: { ...typography.label, color: colors.textSecondary },
  regionTextActive: { color: colors.primary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveText: { ...typography.body, fontWeight: '600' },
  disconnectBtn: { borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginTop: spacing.md },
  disconnectText: { ...typography.body, color: colors.error },
});
