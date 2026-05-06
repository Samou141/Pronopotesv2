import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  accentColor?: string;
  accentColor2?: string;
  icon?: React.ReactNode;
}

const ACCENT = { from: '#22d3ee', to: '#06b6d4' };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  accentColor = ACCENT.from,
  accentColor2 = ACCENT.to,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];

  if (variant === 'primary') {
    return (
      <Pressable
        {...props}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.base, { opacity: pressed || disabled ? 0.8 : 1 }, style as any]}
      >
        <LinearGradient
          colors={[accentColor, accentColor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyle.container]}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, sizeStyle.text]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        sizeStyle.container,
        { opacity: pressed || disabled ? 0.7 : 1 },
        style as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#94a3b8" size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.secondaryText, sizeStyle.text, variant === 'danger' && styles.dangerText]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const SIZE_STYLES = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, gap: 6 },
    text: { fontSize: 13 },
  },
  md: {
    container: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
    text: { fontSize: 14 },
  },
  lg: {
    container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14, gap: 10 },
    text: { fontSize: 16 },
  },
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#0f172a',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dangerText: {
    color: '#f87171',
  },
});
