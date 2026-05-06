import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const validate = () => {
    if (!email || !password || !username) return 'Remplis tous les champs';
    if (username.length < 3) return 'Username : 3 caractères minimum';
    if (password.length < 6) return 'Mot de passe : 6 caractères minimum';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await signUp(email.trim(), password, username.trim().toLowerCase());
      router.replace('/(app)');
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glow} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Crée ton compte</Text>
            <Text style={styles.sub}>Rejoins la communauté PronoPotes</Text>
          </View>

          <View style={styles.card}>
            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <User size={16} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Pseudo (ex: leo_du_75)"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.field}>
              <Mail size={16} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.field}>
              <Lock size={16} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe (min. 6 caractères)"
                placeholderTextColor="#475569"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleRegister}
              />
            </View>

            <Text style={styles.hint}>
              En créant un compte tu reçois <Text style={{ color: '#22d3ee', fontWeight: '700' }}>1000 jetons</Text> de départ 🎉
            </Text>

            <Button
              label={loading ? 'Création...' : 'Créer mon compte'}
              loading={loading}
              onPress={handleRegister}
              size="lg"
              accentColor="#22d3ee"
              accentColor2="#06b6d4"
            />

            <Link href="/auth/login" asChild>
              <Pressable style={styles.backBtn}>
                <Text style={styles.backText}>
                  Déjà inscrit ? <Text style={{ color: '#22d3ee', fontWeight: '700' }}>Se connecter</Text>
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
  container: { flex: 1, backgroundColor: '#0f172a' },
  glow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(34,211,238,0.07)',
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 },
  header: { gap: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: '#64748b' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    gap: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 12,
  },
  errorText: { color: '#f87171', fontSize: 13, fontWeight: '500' },
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
  input: { flex: 1, color: '#f1f5f9', fontSize: 15, height: '100%' },
  hint: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  backBtn: { alignItems: 'center', paddingVertical: 4 },
  backText: { fontSize: 14, color: '#64748b' },
});
