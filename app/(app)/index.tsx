import { Bell, Coins, Hexagon, Sparkles, Calendar, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatches } from '@hooks/useMatches';
import { useAuth } from '@hooks/useAuth';
import { useGroupBets } from '@hooks/useGroups';
import { MatchCard } from '@components/MatchCard';
import { LiveMatchCard } from '@components/LiveMatchCard';
import { BetModal } from '@components/BetModal';
import { Avatar } from '@components/TeamCrest';
import type { Match, Prediction } from '@/types';

const ACCENT = '#22d3ee';
const ACCENT2 = '#06b6d4';
const GRADIENT: [string, string] = ['#22d3ee', '#7c3aed'];

// Hard-coded group for the home screen (first group user is in)
const DEFAULT_GROUP = 'default';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { liveMatches, upcomingMatches, loading, refetch } = useMatches({ limit: 10 });
  const { bets, placeBet } = useGroupBets(DEFAULT_GROUP);

  const [betMatch, setBetMatch] = useState<Match | null>(null);
  const [betPrediction, setBetPrediction] = useState<Prediction>('1');

  const getUserBet = (matchId: number): Prediction | null => {
    const bet = bets.find((b) => b.match_id === matchId);
    return bet ? (bet.prediction as Prediction) : null;
  };

  const handleOpenBet = (match: Match, prediction: Prediction) => {
    setBetMatch(match);
    setBetPrediction(prediction);
  };

  const handleConfirmBet = async (matchId: number, prediction: Prediction, amount: number) => {
    const match = [...liveMatches, ...upcomingMatches].find((m) => m.id === matchId);
    if (!match) return;
    const odds =
      prediction === '1' ? match.odds_home :
      prediction === 'N' ? match.odds_draw :
      match.odds_away;
    await placeBet(matchId, prediction, amount, odds ?? 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Atmospheric background */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={ACCENT} />}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              gradient={GRADIENT}
              size={44}
              initials={profile?.username?.[0] ?? 'T'}
              avatarUrl={profile?.avatar_url}
              ring
            />
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Salut,</Text>
              <Text style={styles.username}>
                {profile?.username ?? 'Champion'}{' '}
                <Text style={styles.level}>· Niveau 14</Text>
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.tokenBadge, { borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}12` }]}>
              <Coins size={14} color={ACCENT} />
              <View>
                <Text style={styles.tokenLabel}>Jetons</Text>
                <Text style={styles.tokenAmount}>
                  {(profile?.global_balance ?? 0).toLocaleString('fr-FR')}
                </Text>
              </View>
            </View>
            <Pressable style={styles.notifBtn}>
              <Bell size={18} color="#94a3b8" />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </View>

        {/* ─── App wordmark (mobile) ─── */}
        <View style={styles.wordmark}>
          <Hexagon size={20} color={ACCENT} strokeWidth={1.5} />
          <Text style={styles.wordmarkText}>
            Prono<Text style={{ color: ACCENT }}>Potes</Text>
          </Text>
        </View>

        {/* ─── Hero ─── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Le foot et le rugby,{'\n'}
            <Text style={[styles.heroAccent, { color: ACCENT }]}>en mode compétition.</Text>
          </Text>
          <Text style={styles.heroSub}>
            {upcomingMatches.length} matchs ouverts aux pronos
          </Text>
        </View>

        {/* ─── Live ─── */}
        {liveMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDot}>
                <View style={styles.liveDotInner} />
              </View>
              <Text style={styles.sectionLabel}>En direct</Text>
            </View>
            {liveMatches.map((m) => (
              <LiveMatchCard
                key={m.id}
                match={m}
                myBet={bets.find((b) => b.match_id === m.id) ?? null}
                accentColor={ACCENT}
                accentColor2={ACCENT2}
              />
            ))}
          </View>
        )}

        {/* ─── Upcoming ─── */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <View style={styles.sectionHeaderLeft}>
              <Calendar size={14} color="#94a3b8" />
              <Text style={styles.sectionLabel}>Prochains matchs</Text>
            </View>
            <Pressable style={styles.filterBtn}>
              <Text style={styles.filterText}>Filtrer</Text>
              <ChevronRight size={12} color="#475569" />
            </Pressable>
          </View>

          {upcomingMatches.length === 0 && !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun match à venir pour le moment</Text>
            </View>
          )}

          {upcomingMatches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              groupId={DEFAULT_GROUP}
              userBet={getUserBet(m.id)}
              onBet={handleOpenBet}
              accentColor={ACCENT}
              accentColor2={ACCENT2}
            />
          ))}
        </View>

        <Text style={styles.footer}>Joue responsable · Jetons fictifs entre potes</Text>
      </ScrollView>

      {/* Bet modal */}
      {betMatch && (
        <BetModal
          match={betMatch}
          groupId={DEFAULT_GROUP}
          virtualBalance={profile?.global_balance ?? 1000}
          initialPrediction={betPrediction}
          accentColor={ACCENT}
          accentColor2={ACCENT2}
          onConfirm={handleConfirmBet}
          onClose={() => setBetMatch(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  bgGlow1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(34,211,238,0.07)',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 40 },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { gap: 1 },
  greeting: { fontSize: 11, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase' },
  username: { fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
  level: { fontSize: 13, color: '#475569', fontWeight: '400' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tokenLabel: { fontSize: 9, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' },
  tokenAmount: { fontSize: 14, fontWeight: '700', color: '#ffffff', letterSpacing: -0.3 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  // Wordmark
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  wordmarkText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  // Hero
  hero: { gap: 6 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, lineHeight: 32 },
  heroAccent: { fontWeight: '800' },
  heroSub: { fontSize: 13, color: '#64748b' },
  // Sections
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 11, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase' },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    opacity: 0.5,
  },
  // Empty
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#475569', textAlign: 'center' },
  footer: {
    fontSize: 10,
    color: '#334155',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingTop: 8,
  },
});
