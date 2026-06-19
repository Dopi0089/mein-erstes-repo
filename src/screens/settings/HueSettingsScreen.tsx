import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { hueApi } from '../../api/hueApi';

export function HueSettingsScreen() {
  const navigation = useNavigation();
  const { settings, saveHue, clearPlatform } = useSettingsStore();
  const [bridgeIp, setBridgeIp] = useState(settings.hue?.bridgeIp ?? '');
  const [username, setUsername] = useState(settings.hue?.username ?? '');
  const [discovering, setDiscovering] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleDiscover = async () => {
    setDiscovering(true);
    const ip = await hueApi.discoverBridge();
    if (ip) { setBridgeIp(ip); Alert.alert('Bridge gefunden', `IP: ${ip}`); }
    else Alert.alert('Keine Bridge gefunden', 'Stelle sicher, dass du im selben WLAN bist.');
    setDiscovering(false);
  };

  const handleRegister = async () => {
    if (!bridgeIp) { Alert.alert('Bitte zuerst IP eingeben oder Bridge suchen'); return; }
    Alert.alert(
      'Bridge-Taste drücken',
      'Drücke jetzt die Taste auf deiner Philips Hue Bridge und tippe dann auf OK.',
      [{ text: 'OK', onPress: async () => {
        const token = await hueApi.registerApp(bridgeIp);
        if (token) { setUsername(token); Alert.alert('Verbunden!', 'API-Key erhalten.'); }
        else Alert.alert('Fehler', 'Bridge-Taste wurde nicht gedrückt oder Bridge nicht erreichbar.');
      }}, { text: 'Abbrechen', style: 'cancel' }]
    );
  };

  const handleSave = async () => {
    setTesting(true);
    hueApi.configure({ bridgeIp, username });
    const ok = await hueApi.testConnection();
    setTesting(false);
    if (!ok) { Alert.alert('Verbindung fehlgeschlagen', 'IP oder API-Key prüfen.'); return; }
    await saveHue({ bridgeIp, username });
    Alert.alert('Gespeichert', undefined, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Philips Hue</Text>
        <Text style={styles.subtitle}>Verbinde deine Hue Bridge über das lokale Netzwerk.</Text>

        <TouchableOpacity style={styles.discoverBtn} onPress={handleDiscover} disabled={discovering}>
          {discovering ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Text style={styles.discoverText}>Bridge automatisch suchen</Text>}
        </TouchableOpacity>

        <Text style={styles.label}>Bridge-IP-Adresse</Text>
        <TextInput style={styles.input} value={bridgeIp} onChangeText={setBridgeIp} placeholder="192.168.1.x" placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" />

        <Text style={styles.label}>API-Key / Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="API-Key" placeholderTextColor={colors.textMuted} autoCapitalize="none" />

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Bridge-Taste drücken & registrieren</Text>
        </TouchableOpacity>

        {settings.hue && (
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => clearPlatform('hue')}>
            <Text style={styles.disconnectText}>Verbindung trennen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={testing}>
          {testing ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Text style={styles.saveText}>Verbindung testen & speichern</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const inputStyle = {
  backgroundColor: colors.background, borderRadius: borderRadius.md,
  borderWidth: 1, borderColor: colors.border, color: colors.textPrimary,
  padding: spacing.md, ...typography.body, marginBottom: spacing.sm,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  title: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.bodySmall, marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: inputStyle,
  discoverBtn: {
    backgroundColor: colors.surfaceHover, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.lg,
  },
  discoverText: { ...typography.body, color: colors.primary },
  registerBtn: {
    backgroundColor: colors.surfaceHover, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg,
  },
  registerText: { ...typography.body, color: colors.warning },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    padding: spacing.md, alignItems: 'center', marginTop: spacing.md,
  },
  saveText: { ...typography.body, fontWeight: '600' },
  disconnectBtn: {
    borderRadius: borderRadius.md, padding: spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.error,
  },
  disconnectText: { ...typography.body, color: colors.error },
});
