import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Plus, Users, ChevronRight, Copy } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroups } from '@hooks/useGroups';
import { Card } from '@ui/Card';
import { Button } from '@ui/Button';
import type { GroupWithDetails } from '@hooks/useGroups';

const ACCENT = '#22d3ee';

function GroupCard({ group, onPress }: { group: GroupWithDetails; onPress: () => void }) {
  const validatedCount = group.members.filter((m) => m.has_paid_real_stake).length;
  const totalPot = validatedCount * (group.real_stake_amount ?? 10);
  const myBalance = group.my_member?.virtual_balance ?? 0;

  const copyCode = async () => {
    await Clipboard.setStringAsync(group.invite_code);
    Alert.alert('Copié !', `Code "${group.invite_code}" copié dans le presse-papier`);
  };

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.groupCard}>
        <View style={styles.groupContent}>
          <View style={styles.groupHeader}>
            <View style={styles.groupAvatar}>
              <Text style={styles.groupAvatarText}>{group.name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>#{group.invite_code}</Text>
                <Pressable onPress={copyCode} hitSlop={8}>
                  <Copy size={12} color="#64748b" />
                </Pressable>
              </View>
            </View>
            <ChevronRight size={18} color="#475569" />
          </View>

          <View style={styles.groupStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{group.members.length}</Text>
              <Text style={styles.statLabel}>Potes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: ACCENT }]}>{totalPot}€</Text>
              <Text style={styles.statLabel}>Cagnotte</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>{myBalance}</Text>
              <Text style={styles.statLabel}>Mes jetons</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, loading, refetch, createGroup, joinGroup } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [stake, setStake] = useState('10');
  const [code, setCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setActionLoading(true);
    try {
      const id = await createGroup(groupName.trim(), parseFloat(stake) || 10);
      setShowCreate(false);
      setGroupName('');
      router.push(`/(app)/groups/${id}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async () => {
    if (code.trim().length !== 6) { Alert.alert('Code invalide', 'Le code doit faire 6 caractères'); return; }
    setActionLoading(true);
    try {
      const id = await joinGroup(code.trim());
      setShowJoin(false);
      setCode('');
      router.push(`/(app)/groups/${id}`);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={ACCENT} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mes Groupes</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => { setShowJoin(true); setShowCreate(false); }} style={styles.headerBtn}>
              <Users size={16} color={ACCENT} />
              <Text style={[styles.headerBtnText, { color: ACCENT }]}>Rejoindre</Text>
            </Pressable>
            <Pressable onPress={() => { setShowCreate(true); setShowJoin(false); }} style={[styles.headerBtn, styles.createBtn]}>
              <Plus size={16} color="#0f172a" />
              <Text style={[styles.headerBtnText, { color: '#0f172a' }]}>Créer</Text>
            </Pressable>
          </View>
        </View>

        {/* Create group form */}
        {showCreate && (
          <Card style={styles.form}>
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Nouveau groupe</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nom du groupe (ex: Les Potes du Loft)"
                placeholderTextColor="#475569"
                value={groupName}
                onChangeText={setGroupName}
              />
              <View style={styles.stakeRow}>
                <Text style={styles.stakeLabel}>Mise réelle par joueur</Text>
                <View style={styles.stakeInput}>
                  <TextInput
                    style={styles.stakeField}
                    placeholder="10"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={stake}
                    onChangeText={setStake}
                  />
                  <Text style={styles.stakeUnit}>€</Text>
                </View>
              </View>
              <View style={styles.formActions}>
                <Button label="Annuler" variant="secondary" size="sm" onPress={() => setShowCreate(false)} />
                <Button
                  label={actionLoading ? 'Création...' : 'Créer'}
                  loading={actionLoading}
                  size="sm"
                  onPress={handleCreate}
                  accentColor={ACCENT}
                  accentColor2="#06b6d4"
                />
              </View>
            </View>
          </Card>
        )}

        {/* Join group form */}
        {showJoin && (
          <Card style={styles.form}>
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Rejoindre un groupe</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Code invitation (ex: AB3X7Z)"
                placeholderTextColor="#475569"
                autoCapitalize="characters"
                maxLength={6}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
              />
              <View style={styles.formActions}>
                <Button label="Annuler" variant="secondary" size="sm" onPress={() => setShowJoin(false)} />
                <Button
                  label={actionLoading ? 'Rejoindre...' : 'Rejoindre'}
                  loading={actionLoading}
                  size="sm"
                  onPress={handleJoin}
                  accentColor={ACCENT}
                  accentColor2="#06b6d4"
                />
              </View>
            </View>
          </Card>
        )}

        {/* Groups list */}
        {groups.length === 0 && !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucun groupe</Text>
            <Text style={styles.emptyText}>Crée ou rejoins un groupe pour commencer à parier avec tes potes</Text>
          </View>
        ) : (
          groups.map((g) => (
            <GroupCard key={g.id} group={g} onPress={() => router.push(`/(app)/groups/${g.id}`)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  createBtn: {
    backgroundColor: '#22d3ee',
    borderColor: 'transparent',
  },
  headerBtnText: { fontSize: 13, fontWeight: '600' },
  // Forms
  form: {},
  formContent: { padding: 20, gap: 14 },
  formTitle: { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  formInput: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    color: '#f1f5f9',
    fontSize: 15,
  },
  stakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stakeLabel: { fontSize: 14, color: '#94a3b8' },
  stakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    height: 36,
    gap: 4,
    minWidth: 80,
  },
  stakeField: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1 },
  stakeUnit: { color: '#64748b', fontSize: 14 },
  formActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  // Group card
  groupCard: {},
  groupContent: { padding: 16, gap: 16 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34,211,238,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: { fontSize: 20, fontWeight: '700', color: '#22d3ee' },
  groupInfo: { flex: 1, gap: 3 },
  groupName: { fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeText: { fontSize: 12, color: '#64748b', fontFamily: 'monospace', letterSpacing: 1 },
  groupStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 14,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  // Empty
  empty: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#64748b' },
  emptyText: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
