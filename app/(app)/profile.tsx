import { useRouter } from 'expo-router';
import { LogOut, Edit3, Coins, Trophy, Flame } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { Avatar } from '@components/TeamCrest';
import { Card } from '@ui/Card';
import { Button } from '@ui/Button';

const ACCENT = '#22d3ee';
const GRADIENT: [string, string] = ['#22d3ee', '#7c3aed'];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!username.trim() || username === profile?.username) { setEditing(false); return; }
    setLoading(true);
    try {
      await updateProfile({ username: username.trim() });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.glow} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Avatar
            gradient={GRADIENT}
            size={80}
            initials={profile?.username?.[0] ?? 'T'}
            avatarUrl={profile?.avatar_url}
            ring
          />
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoFocus
                placeholderTextColor="#475569"
              />
              <Pressable onPress={handleSave} style={styles.saveBtn}>
                <Text style={[styles.saveBtnText, { color: ACCENT }]}>
                  {loading ? '...' : 'OK'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={styles.username}>{profile?.username ?? 'Champion'}</Text>
              <Edit3 size={14} color="#64748b" />
            </Pressable>
          )}
          <Text style={styles.level}>Niveau 14 · Parieur Pro</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(34,211,238,0.12)', borderColor: 'rgba(34,211,238,0.3)' }]}>
              <Coins size={18} color={ACCENT} />
            </View>
            <Text style={[styles.statValue, { color: ACCENT }]}>
              {(profile?.global_balance ?? 0).toLocaleString('fr-FR')}
            </Text>
            <Text style={styles.statLabel}>Jetons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' }]}>
              <Trophy size={18} color="#fbbf24" />
            </View>
            <Text style={[styles.statValue, { color: '#fbbf24' }]}>—</Text>
            <Text style={styles.statLabel}>Victoires</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.3)' }]}>
              <Flame size={18} color="#fb923c" />
            </View>
            <Text style={[styles.statValue, { color: '#fb923c' }]}>—</Text>
            <Text style={styles.statLabel}>Série</Text>
          </View>
        </View>

        {/* About */}
        <Card>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>À propos</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>@{profile?.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign out */}
        <Button
          label="Se déconnecter"
          variant="danger"
          size="lg"
          onPress={handleSignOut}
          icon={<LogOut size={16} color="#f87171" />}
        />

        <Text style={styles.footer}>PronoPotes · Jetons fictifs entre amis</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  glow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 20, paddingBottom: 40, alignItems: 'stretch' },
  avatarSection: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  level: { fontSize: 13, color: '#64748b' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    borderBottomWidth: 2,
    borderBottomColor: '#22d3ee',
    paddingBottom: 4,
    minWidth: 150,
  },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(34,211,238,0.12)' },
  saveBtnText: { fontSize: 14, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 8 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
  cardContent: { padding: 20, gap: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLabel: { fontSize: 14, color: '#64748b' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#e2e8f0' },
  footer: { fontSize: 11, color: '#334155', textAlign: 'center', letterSpacing: 0.5 },
});
