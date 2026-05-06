import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  glow?: string;
  intensity?: number;
}

export function Card({ children, style, glow, intensity = 20, ...props }: CardProps) {
  return (
    <View style={[styles.wrapper, glow ? { shadowColor: glow, shadowOpacity: 0.35 } : {}, style as any]} {...props}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 30,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  inner: {
    flex: 1,
  },
});
