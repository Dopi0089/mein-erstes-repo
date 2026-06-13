export const colors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  border: '#334155',
  primary: '#3b82f6',
  primaryDark: '#1d4ed8',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',

  platforms: {
    hue: '#fbbf24',
    shelly: '#f97316',
    ikea: '#0ea5e9',
    tuya: '#a78bfa',
    eufy: '#34d399',
  },

  deviceTypes: {
    light: '#fbbf24',
    switch: '#60a5fa',
    sensor: '#34d399',
    camera: '#f87171',
    thermostat: '#fb923c',
    plug: '#a78bfa',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '600' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
};
