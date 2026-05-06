import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowUpRight, Flame, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { TeamCrest } from '@components/TeamCrest';
import type { Match, Prediction } from '@/types';

const ACCENT = {
  hue: '#22d3ee',
  hue2: '#06b6d4',
  soft: 'rgba(34,211,238,0.12)',
  border: 'rgba(34,211,238,0.35)',
};

interface MatchCardProps {
  match: Match;
  groupId: string;
  userBet?: Prediction | null;
  onBet?: (match: Match, prediction: Prediction) => void;
  accentColor?: string;
  accentColor2?: string;
}

interface OddButtonProps {
  label: string;
  value: number | null;
  selected: boolean;
  onPress: () => void;
  accentColor: string;
  accentColor2: string;
}

function OddButton({ label, value, selected, onPress, accentColor, accentColor2 }: OddButtonProps) {
  const [pressed, setPressed] = useState(false);

  if (selected) {
    return (
      <LinearGradient
        colors={[accentColor, accentColor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.oddBtn, styles.oddBtnSelected]}
      >
        <Text style={[styles.oddLabel, { color: '#0f172a' }]}>{label}</Text>
        <Text style={[styles.oddValue, { color: '#0f172a' }]}>
          {value != null ? value.toFixed(2) : '—'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.oddBtn, pressed && styles.oddBtnPressed]}
    >
      <Text style={styles.oddLabel}>{label}</Text>
      <Text style={styles.oddValue}>
        {value != null ? value.toFixed(2) : '—'}
      </Text>
    </Pressable>
  );
}

export function MatchCard({
  match,
  groupId,
  userBet,
  onBet,
  accentColor = ACCENT.hue,
  accentColor2 = ACCENT.hue2,
}: MatchCardProps) {
  const homeShort = match.home_team.slice(0, 3).toUpperCase();
  const awayShort = match.away_team.slice(0, 3).toUpperCase();
  const isHot = (match.odds_home ?? 0) > 1 && (match.odds_home ?? 99) < 1.6;

  const handleOddPress = (prediction: Prediction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBet?.(match, prediction);
  };

  const handleParierPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!userBet) onBet?.(match, '1');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.round((d.getTime() - now.getTime()) / 86400000);
    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) return `Ce soir · ${timeStr}`;
    if (diffDays === 1) return `Demain · ${timeStr}`;
    return `${d.toLocaleDateString('fr-FR', { weekday: 'short' })}. · ${timeStr}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* ─── Meta row ─── */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Badge
              label={match.sport === 'foot' ? 'Foot' : 'Rugby'}
              variant={match.sport === 'foot' ? 'sport-foot' : 'sport-rugby'}
            />
            {match.competition && (
              <Text style={styles.comp} numberOfLines={1}>{match.competition}</Text>
            )}
          </View>
          <View style={styles.metaRight}>
            {isHot && <Badge label="Hot" variant="hot" />}
            <Text style={styles.dateText}>{formatDate(match.match_date)}</Text>
          </View>
        </View>

        {/* ─── Teams row ─── */}
        <View style={styles.teamsRow}>
          {/* Home */}
          <View style={styles.teamSide}>
            <TeamCrest
              colors={match.home_colors}
              label={homeShort}
              logoUrl={match.home_logo}
              size={44}
            />
            <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
          </View>

          <Text style={styles.vs}>VS</Text>

          {/* Away */}
          <View style={[styles.teamSide, styles.teamSideRight]}>
            <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
              {match.away_team}
            </Text>
            <TeamCrest
              colors={match.away_colors}
              label={awayShort}
              logoUrl={match.away_logo}
              size={44}
            />
          </View>
        </View>

        {/* ─── Odds + CTA ─── */}
        <View style={styles.oddsRow}>
          <OddButton
            label="1"
            value={match.odds_home}
            selected={userBet === '1'}
            onPress={() => handleOddPress('1')}
            accentColor={accentColor}
            accentColor2={accentColor2}
          />
          <OddButton
            label="N"
            value={match.odds_draw}
            selected={userBet === 'N'}
            onPress={() => handleOddPress('N')}
            accentColor={accentColor}
            accentColor2={accentColor2}
          />
          <OddButton
            label="2"
            value={match.odds_away}
            selected={userBet === '2'}
            onPress={() => handleOddPress('2')}
            accentColor={accentColor}
            accentColor2={accentColor2}
          />

          {/* Parier CTA */}
          <Pressable onPress={handleParierPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient
              colors={[accentColor, accentColor2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.parierBtn}
            >
              <Text style={styles.parierText}>{userBet ? 'Modif.' : 'Parier'}</Text>
              <ArrowUpRight size={14} color="#0f172a" strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* ─── Footer ─── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Users size={11} color="#64748b" />
            <Text style={styles.footerText}>
              <Text style={styles.footerCount}>{userBet ? '★ ' : ''}Déjà {Math.floor(Math.random() * 10) + 2}</Text>
              {' '}potes ont parié
            </Text>
          </View>
          {match.status === 'NS' && (
            <View style={styles.closesSoon}>
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.closesText}>Ouvert</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comp: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  dateText: {
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  // Teams
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  teamSideRight: {
    justifyContent: 'flex-end',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    flex: 1,
  },
  vs: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 1.5,
  },
  // Odds
  oddsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'stretch',
  },
  oddBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 2,
  },
  oddBtnSelected: {
    borderColor: 'transparent',
  },
  oddBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ scale: 0.97 }],
  },
  oddLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  oddValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.3,
  },
  parierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 72,
  },
  parierText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
  },
  footerCount: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  closesSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  closesText: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
