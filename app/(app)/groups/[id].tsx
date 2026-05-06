import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Crown, Flame, Shield, Check, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroups, useGroupBets } from '@hooks/useGroups';
import { useMatches } from '@hooks/useMatches';
import { useAuth } from '@hooks/useAuth';
import { CagnotteWidget } from '@components/CagnotteWidget';
import { MatchCard } from '@components/MatchCard';
import { BetModal } from '@components/BetModal';
import { Avatar } from '@components/TeamCrest';
import { Card } from '@ui/Card';
import type { Match, Prediction, Profile, GroupMember } from '@/types';

const ACCENT = '#22d3ee';
const MEDAL_COLORS = ['#fbbf24', '#cbd5e1', '#f97316'];

function LeaderboardRow({
  member,
  rank,
  isMe,
  accentColor,
}: {
  member: GroupMember & { profile?: Profile };
  rank: number;
  isMe: boolean;
  accentColor: string;
}) {
  const gradient = rank === 1
    ? ['#fbbf24', '#f59e0b']
    : rank === 2
    ? ['#cbd5e1', '#94a3b8']
    : rank === 3
    ? ['#f97316', '#c2410c']
    : ['#334155', '#1e293b'];

  const medalColor = MEDAL_COLORS[rank - 1];

  return (
    <View style={[styles.lbRow, isMe && { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}33` }]}>
      <View style={styles.lbRank}>
        {rank <= 3 ? (
          <Text style={[styles.lbMedal, { color: medalColor }]}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text style={styles.lbRankNum}>{rank}</Text>
        )}
      </View>
      <Avatar
        gradient={gradient}
        size={36}
        initials={member.profile?.username?.[0] ?? '?'}
        avatarUrl={member.profile?.avatar_url}
      />
      <View style={styles.lbInfo}>
        <Text style={[styles.lbName, isMe && { color: accentColor }]}>
          {isMe ? 'Toi' : (member.profile?.username ?? 'Joueur')}
          {rank === 1 && <Crown size={12} color="#fbbf24" fill="#fbbf24" />}
        </Text>
      </View>
      <View style={styles.lbRight}>
        <Text style={[styles.lbBalance, rank <= 3 && { color: medalColor }]}>
          {member.virtual_balance.toLocaleString('fr-FR')}
        </Text>
        <Text style={styles.lbBalanceLabel}>jetons</Text>
      </View>
    </View>
  );
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { groups, loading: groupsLoading, refetch: refetchGroups, markPaid } = useGroups();
  const { upcomingMatches, loading: matchesLoading } = useMatches({ status: 'NS' });
  const { bets, placeBet } = useGroupBets(id);

  const [betMatch, setBetMatch] = useState<Match | null>(null);
  const [betPrediction, setBetPrediction] = useState<Prediction>('1');
  const [activeTab, setActiveTab] = useState<'classement' | 'paris' | 'admin'>('classement');

  const group = groups.find((g) => g.id === id);
  const isAdmin = group?.admin_id === user?.id;

  const sortedMembers = useMemo(
    () => [...(group?.members ?? [])].sort((a, b) => b.virtual_balance - a.virtual_balance),
    [group?.members],
  );

  const getUserBet = (matchId: number) => {
    const bet = bets.find((b) => b.match_id === matchId && b.user_id === user?.id);
    return bet ? (bet.prediction as Prediction) : null;
  };

  const handleMarkPaid = async (userId: string, paid: boolean) => {
    try {
      await markPaid(id, userId, paid);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const handleConfirmBet = async (matchId: number, prediction: Prediction, amount: number) => {
    const match = upcomingMatches.find((m) => m.id === matchId);
    if (!match) return;
    const odds =
      prediction === '1' ? match.odds_home :
      prediction === 'N' ? match.odds_draw :
      match.odds_away;
    await placeBet(matchId, prediction, amount, odds ?? 1);
  };

  const myMember = group?.my_member;

  if (!group && !groupsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Groupe introuvable</Text>
          <Pressable onPress={() => router.back()} style={styles.backPressable}>
            <Text style={{ color: ACCENT }}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = ['classement', 'paris', ...(isAdmin ? ['admin'] : [])] as const;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#94a3b8" />
        </Pressable>
        <View style={styles.topbarInfo}>
          <Text style={styles.topbarTitle}>{group?.name ?? '...'}</Text>
          <Text style={styles.topbarSub}>#{group?.invite_code}</Text>
        </View>
        {isAdmin && <Shield size={18} color="#22d3ee" />}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={groupsLoading || matchesLoading}
            onRefresh={refetchGroups}
            tintColor={ACCENT}
          />
        }
      >
        {/* Cagnotte */}
        <CagnotteWidget
          members={group?.members ?? []}
          matchLabel={`Mise: ${group?.real_stake_amount ?? 10}€/joueur`}
          accentColor={ACCENT}
          accentColor2="#06b6d4"
          onAdd={() => {}}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { borderBottomColor: ACCENT }]}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: ACCENT }]}>
                {tab === 'classement' ? 'Classement' : tab === 'paris' ? 'Parier' : 'Admin'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Classement */}
        {activeTab === 'classement' && (
          <Card>
            <View style={styles.leaderboard}>
              {sortedMembers.map((m, i) => (
                <LeaderboardRow
                  key={m.user_id}
                  member={m}
                  rank={i + 1}
                  isMe={m.user_id === user?.id}
                  accentColor={ACCENT}
                />
              ))}
            </View>
          </Card>
        )}

        {/* Paris */}
        {activeTab === 'paris' && (
          <View style={styles.matchList}>
            {upcomingMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                groupId={id}
                userBet={getUserBet(m.id)}
                onBet={(match, pred) => { setBetMatch(match); setBetPrediction(pred); }}
                accentColor={ACCENT}
                accentColor2="#06b6d4"
              />
            ))}
            {upcomingMatches.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucun match ouvert aux paris</Text>
              </View>
            )}
          </View>
        )}

        {/* Admin */}
        {activeTab === 'admin' && isAdmin && (
          <Card>
            <View style={styles.adminContent}>
              <Text style={styles.adminTitle}>Gestion des paiements</Text>
              <Text style={styles.adminSub}>
                Mise par joueur : <Text style={{ color: ACCENT, fontWeight: '700' }}>{group?.real_stake_amount ?? 10}€</Text>
              </Text>
              {sortedMembers.map((m) => (
                <View key={m.user_id} style={styles.adminRow}>
                  <Avatar
                    gradient={['#22d3ee', '#7c3aed']}
                    size={32}
                    initials={m.profile?.username?.[0] ?? '?'}
                    avatarUrl={m.profile?.avatar_url}
                  />
                  <Text style={styles.adminName} numberOfLines={1}>
                    {m.user_id === user?.id ? 'Toi' : (m.profile?.username ?? 'Joueur')}
                  </Text>
                  <View style={styles.adminPaid}>
                    {m.has_paid_real_stake ? (
                      <View style={styles.paidBadge}>
                        <Check size={12} color="#4ade80" />
                        <Text style={styles.paidText}>Payé</Text>
                      </View>
                    ) : (
                      <View style={styles.unpaidBadge}>
                        <X size={12} color="#f87171" />
                        <Text style={styles.unpaidText}>En attente</Text>
                      </View>
                    )}
                  </View>
                  <Switch
                    value={m.has_paid_real_stake}
                    onValueChange={(v) => handleMarkPaid(m.user_id, v)}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${ACCENT}55` }}
                    thumbColor={m.has_paid_real_stake ? ACCENT : '#475569'}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bet modal */}
      {betMatch && (
        <BetModal
          match={betMatch}
          groupId={id}
          virtualBalance={myMember?.virtual_balance ?? 1000}
          initialPrediction={betPrediction}
          accentColor={ACCENT}
          accentColor2="#06b6d4"
          onConfirm={handleConfirmBet}
          onClose={() => setBetMatch(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressable: { padding: 8 },
  topbarInfo: { flex: 1, gap: 2 },
  topbarTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  topbarSub: { fontSize: 12, color: '#64748b', letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.3,
  },
  // Leaderboard
  leaderboard: { padding: 8, gap: 4 },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lbRank: { width: 28, alignItems: 'center' },
  lbMedal: { fontSize: 20 },
  lbRankNum: { fontSize: 14, fontWeight: '600', color: '#475569' },
  lbInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  lbName: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  lbRight: { alignItems: 'flex-end', gap: 1 },
  lbBalance: { fontSize: 16, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.3 },
  lbBalanceLabel: { fontSize: 10, color: '#475569', letterSpacing: 0.5 },
  // Matches
  matchList: { gap: 12 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#475569' },
  // Admin
  adminContent: { padding: 20, gap: 16 },
  adminTitle: { fontSize: 17, fontWeight: '700', color: '#f1f5f9' },
  adminSub: { fontSize: 13, color: '#64748b' },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  adminName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#e2e8f0' },
  adminPaid: { alignItems: 'flex-end' },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  paidText: { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  unpaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  unpaidText: { fontSize: 11, color: '#f87171', fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18, color: '#64748b' },
});
