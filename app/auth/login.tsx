import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Hexagon, Mail, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplis tous les champs'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      router.replace('/(app)');
    } catch (e: any) {
      setError(e.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Hexagon size={48} color="#22d3ee" strokeWidth={1.5} />
              <View style={styles.logoDot} />
            </View>
            <Text style={styles.logoText}>
              Prono<Text style={{ color: '#22d3ee' }}>Potes</Text>
            </Text>
            <Text style={styles.logoSub}>Pronostics entre amis</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connexion</Text>

            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <View style={styles.fieldIcon}><Mail size={16} color="#64748b" /></View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.fieldIcon}><Lock size={16} color="#64748b" /></View>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#475569"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
            </View>

            <Button
              label={loading ? 'Connexion...' : 'Se connecter'}
              loading={loading}
              onPress={handleLogin}
              size="lg"
              accentColor="#22d3ee"
              accentColor2="#06b6d4"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/auth/register" asChild>
              <Pressable style={styles.registerBtn}>
                <Text style={styles.registerText}>
                  Pas encore de compte ?{' '}
                  <Text style={{ color: '#22d3ee', fontWeight: '700' }}>Créer un compte</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  glow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  glow2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 40,
  },
  logoSection: {
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: 14,
    color: '#64748b',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 52,
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldIcon: {
    width: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
    height: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    color: '#475569',
    fontSize: 12,
  },
  registerBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  registerText: {
    fontSize: 14,
    color: '#64748b',
  },
});
