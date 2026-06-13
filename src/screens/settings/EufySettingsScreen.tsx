import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { eufyApi } from '@/api/eufyApi';

export function EufySettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveEufy, clearPlatform } = useSettingsStore();
  const [email, setEmail] = useState(settings.eufy?.email ?? '');
  const [password, setPassword] = useState(settings.eufy?.password ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email || !password) { Alert.alert('E-Mail und Passwort erforderlich'); return; }
    setSaving(true);
    eufyApi.configure({ email, password });
    const ok = await eufyApi.testConnection();
    setSaving(false);
    if (!ok) { Alert.alert('Login fehlgeschlagen', 'E-Mail oder Passwort prüfen.'); return; }
    await saveEufy({ email, password });
    Alert.alert('Gespeichert', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Eufy</Text>
        <Text style={styles.subtitle}>Melde dich mit deinem Eufy/Anker-Konto an.</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Eufy nutzt keine offizielle API. Die Zugangsdaten werden lokal verschlüsselt gespeichert und nur für den Gerätezugriff verwendet.
          </Text>
        </View>

        <Text style={styles.label}>E-Mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="deine@email.de" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Passwort</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Passwort" placeholderTextColor={colors.textMuted} secureTextEntry />

        {settings.eufy && (
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => clearPlatform('eufy')}>
            <Text style={styles.disconnectText}>Verbindung trennen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Text style={styles.saveText}>Anmelden & speichern</Text>}
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
  warningBox: { backgroundColor: colors.warning + '22', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.warning + '55' },
  warningText: { ...typography.bodySmall, color: colors.warning },
  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.md, ...typography.body, marginBottom: spacing.sm },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveText: { ...typography.body, fontWeight: '600' },
  disconnectBtn: { borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginTop: spacing.md },
  disconnectText: { ...typography.body, color: colors.error },
});
