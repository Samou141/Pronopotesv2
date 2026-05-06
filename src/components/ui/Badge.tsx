import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BadgeVariant = 'live' | 'hot' | 'success' | 'warning' | 'muted' | 'sport-foot' | 'sport-rugby';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  live: { bg: 'rgba(239,68,68,0.9)', border: 'transparent', text: '#ffffff' },
  hot: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', text: '#fb923c' },
  success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
  warning: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  muted: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94a3b8' },
  'sport-foot': { bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.25)', text: '#67e8f9' },
  'sport-rugby': { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', text: '#c4b5fd' },
};

export function Badge({ label, variant = 'muted', pulse = false }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <View style={[styles.container, { backgroundColor: s.bg, borderColor: s.border }]}>
      {pulse && <View style={[styles.dot, { backgroundColor: s.text }]} />}
      <Text style={[styles.label, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
