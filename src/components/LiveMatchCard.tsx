import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Target } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { TeamCrest } from '@components/TeamCrest';
import type { Match, Bet } from '@/types';

interface LiveMatchCardProps {
  match: Match;
  myBet?: Bet | null;
  accentColor?: string;
  accentColor2?: string;
}

export function LiveMatchCard({
  match,
  myBet,
  accentColor = '#22d3ee',
  accentColor2 = '#06b6d4',
}: LiveMatchCardProps) {
  const homeShort = match.home_team.slice(0, 3).toUpperCase();
  const awayShort = match.away_team.slice(0, 3).toUpperCase();
  const total = match.home_score + match.away_score || 1;
  const homeProb = Math.round((match.away_score + 1) / (total + 2) * 100);
  const awayProb = 100 - homeProb;

  return (
    <Card glow="#ef4444" style={styles.card}>
      {/* Background glow */}
      <View style={[StyleSheet.absoluteFill, styles.redGlow]} />

      <View style={styles.content}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Badge label="LIVE" variant="live" pulse />
          <View style={styles.timer}>
            <Clock size={12} color="#f87171" />
            <Text style={styles.timerText}>{match.minute ?? 0}'</Text>
            <Text style={styles.halfText}>· {match.sport === 'rugby' ? '2e MT' : '2T'}</Text>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <View style={styles.teamCol}>
            <TeamCrest colors={match.home_colors} label={homeShort} logoUrl={match.home_logo} size={64} />
            <Text style={styles.teamName}>{match.home_team}</Text>
            <Text style={styles.teamSub}>Domicile</Text>
          </View>

          <View style={styles.scoreMid}>
            <View style={styles.scoreNumbers}>
              <Text style={styles.scoreDigit}>{match.home_score}</Text>
              <Text style={styles.scoreSep}>:</Text>
              <Text style={styles.scoreDigit}>{match.away_score}</Text>
            </View>
            <Text style={styles.scoreSub}>Score</Text>
          </View>

          <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
            <TeamCrest colors={match.away_colors} label={awayShort} logoUrl={match.away_logo} size={64} />
            <Text style={[styles.teamName, { textAlign: 'right' }]}>{match.away_team}</Text>
            <Text style={styles.teamSub}>Extérieur</Text>
          </View>
        </View>

        {/* Win probability bar */}
        <View style={styles.probSection}>
          <View style={styles.probLabels}>
            <Text style={styles.probPct}>{homeProb}%</Text>
            <Text style={styles.probCenter}>Probabilité</Text>
            <Text style={styles.probPct}>{awayProb}%</Text>
          </View>
          <View style={styles.probBar}>
            <LinearGradient
              colors={[match.home_colors[0] ?? '#1e40af', match.home_colors[1] ?? '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.probFill, { flex: homeProb }]}
            />
            <LinearGradient
              colors={[match.away_colors[1] ?? '#334155', match.away_colors[0] ?? '#1e293b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.probFill, { flex: awayProb }]}
            />
          </View>
        </View>

        {/* Mon pari */}
        {myBet && (
          <View style={[styles.myBet, { borderColor: `${accentColor}55`, backgroundColor: `${accentColor}10` }]}>
            <View style={[styles.myBetIcon, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}44` }]}>
              <Target size={14} color={accentColor} />
            </View>
            <View style={styles.myBetInfo}>
              <Text style={styles.myBetLabel}>Ton pari</Text>
              <Text style={styles.myBetValue}>
                {myBet.prediction === '1' ? match.home_team : myBet.prediction === '2' ? match.away_team : 'Nul'}
                {' · '}{myBet.amount} jetons
              </Text>
            </View>
            <View style={styles.myBetGain}>
              <Text style={styles.myBetLabel}>Gain potentiel</Text>
              <Text style={[styles.myBetGainValue, { color: accentColor }]}>
                +{myBet.potential_gain}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  redGlow: {
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    letterSpacing: -0.3,
  },
  halfText: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  teamSub: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreMid: {
    alignItems: 'center',
    gap: 4,
  },
  scoreNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  scoreDigit: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  scoreSep: {
    fontSize: 24,
    fontWeight: '300',
    color: '#334155',
  },
  scoreSub: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // Probability bar
  probSection: {
    gap: 8,
  },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  probPct: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  probCenter: {
    fontSize: 11,
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  probBar: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  probFill: {
    height: '100%',
  },
  // My bet
  myBet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  myBetIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myBetInfo: {
    flex: 1,
    gap: 2,
  },
  myBetLabel: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  myBetValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  myBetGain: {
    alignItems: 'flex-end',
    gap: 2,
  },
  myBetGainValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
