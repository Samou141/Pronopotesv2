import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TeamCrestProps {
  colors: string[];
  label: string;
  logoUrl?: string | null;
  size?: number;
}

export function TeamCrest({ colors, label, logoUrl, size = 48 }: TeamCrestProps) {
  const radius = size * 0.28;
  const fontSize = size * 0.28;

  if (logoUrl) {
    return (
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius: radius }]}>
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size * 0.7, height: size * 0.7 }}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors[0] ?? '#1e293b', colors[1] ?? '#334155']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { width: size, height: size, borderRadius: radius }]}
    >
      {/* highlight sheen */}
      <View style={[StyleSheet.absoluteFill, styles.sheen, { borderRadius: radius }]} />
      <Text style={[styles.label, { fontSize }]}>{label.slice(0, 3).toUpperCase()}</Text>
    </LinearGradient>
  );
}

export function Avatar({
  gradient,
  size = 40,
  initials = '',
  avatarUrl,
  ring = false,
}: {
  gradient: string[];
  size?: number;
  initials?: string;
  avatarUrl?: string | null;
  ring?: boolean;
}) {
  const fontSize = size * 0.38;

  return (
    <View style={[
      styles.avatar,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        shadowColor: gradient[0],
        borderWidth: ring ? 2 : 0,
        borderColor: ring ? gradient[0] : 'transparent',
      },
    ]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={[gradient[0] ?? '#334155', gradient[1] ?? '#1e293b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize, letterSpacing: -0.5 }}>
            {initials.slice(0, 2).toUpperCase()}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sheen: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: 0,
    left: 0,
    right: '60%',
    bottom: '60%',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
