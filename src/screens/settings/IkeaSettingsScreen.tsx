import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { ikeaApi } from '@/api/ikeaApi';

export function IkeaSettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveIkea, clearPlatform } = useSettingsStore();
  const [hubIp, setHubIp] = useState(settings.ikea?.hubIp ?? '');
  const [accessToken, setAccessToken] = useState(settings.ikea?.accessToken ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    ikeaApi.configure({ hubIp, accessToken });
    const ok = await ikeaApi.testConnection();
    setSaving(false);
    if (!ok) { Alert.alert('Verbindung fehlgeschlagen', 'IP-Adresse und Access-Token prüfen.'); return; }
    await saveIkea({ hubIp, accessToken });
    Alert.alert('Gespeichert', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>IKEA Home Smart</Text>
        <Text style={styles.subtitle}>Verbinde deinen IKEA Dirigera Hub über das lokale Netzwerk.</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Den Access-Token erhältst du über die IKEA Home Smart App oder über das Dirigera API-Pairing (PKCE OAuth).
          </Text>
        </View>

        <Text style={styles.label}>Hub IP-Adresse</Text>
        <TextInput style={styles.input} value={hubIp} onChangeText={setHubIp} placeholder="192.168.1.x" placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" />

        <Text style={styles.label}>Access-Token</Text>
        <TextInput style={[styles.input, styles.tokenInput]} value={accessToken} onChangeText={setAccessToken} placeholder="Token aus der App" placeholderTextColor={colors.textMuted} autoCapitalize="none" multiline />

        {settings.ikea && (
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => clearPlatform('ikea')}>
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
  infoBox: { backgroundColor: colors.primary + '22', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary + '55' },
  infoText: { ...typography.bodySmall, color: colors.primary },
  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.md, ...typography.body, marginBottom: spacing.sm },
  tokenInput: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveText: { ...typography.body, fontWeight: '600' },
  disconnectBtn: { borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginTop: spacing.md },
  disconnectText: { ...typography.body, color: colors.error },
});
