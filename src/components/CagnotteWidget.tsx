import { LinearGradient } from 'expo-linear-gradient';
import { Coins, TrendingUp, Wallet, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@ui/Card';
import { Avatar } from '@components/TeamCrest';
import type { GroupMember, Profile } from '@/types';

const GRADIENTS: [string, string][] = [
  ['#fbbf24', '#f59e0b'],
  ['#cbd5e1', '#94a3b8'],
  ['#f97316', '#c2410c'],
  ['#a78bfa', '#7c3aed'],
  ['#22d3ee', '#0891b2'],
  ['#f87171', '#dc2626'],
  ['#34d399', '#059669'],
  ['#60a5fa', '#2563eb'],
];

interface CagnotteWidgetProps {
  members: (GroupMember & { profile?: Profile })[];
  matchLabel?: string;
  accentColor?: string;
  accentColor2?: string;
  onAdd?: () => void;
}

export function CagnotteWidget({
  members,
  matchLabel = 'Pari du groupe',
  accentColor = '#22d3ee',
  accentColor2 = '#06b6d4',
  onAdd,
}: CagnotteWidgetProps) {
  const validatedCount = members.filter((m) => m.has_paid_real_stake).length;
  const total = members.length;
  const progress = total > 0 ? validatedCount / total : 0;

  // Animated counter for total pot
  const totalStake = members.reduce((s, m) => s + (m.has_paid_real_stake ? 10 : 0), 0);
  const animatedTotal = useRef(new Animated.Value(0)).current;
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    animatedTotal.addListener(({ value }) => setDisplayTotal(Math.floor(value)));
    Animated.timing(animatedTotal, {
      toValue: totalStake,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => animatedTotal.removeAllListeners();
  }, [totalStake]);

  return (
    <Card glow={accentColor} style={styles.card}>
      {/* Background glow blobs */}
      <View style={[StyleSheet.absoluteFill, styles.glowBg]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Wallet size={12} color={accentColor} />
              <Text style={[styles.title, { color: accentColor }]}>Cagnotte du groupe</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalAmount}>{displayTotal.toFixed(0)}€</Text>
              <Coins size={18} color={accentColor} />
            </View>
            <Text style={styles.matchLabel}>{matchLabel}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.trendBadge}>
              <TrendingUp size={10} color="#4ade80" />
              <Text style={styles.trendText}>Actif</Text>
            </View>
            <Text style={styles.bonusLabel}>Bonus victoire</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressCount}>{validatedCount}</Text>/{total} ont payé
            </Text>
            <Text style={[styles.progressPct, { color: accentColor }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[accentColor, accentColor2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { flex: progress }]}
            />
            <View style={{ flex: 1 - progress }} />
          </View>
        </View>

        {/* Members list */}
        <View style={styles.members}>
          {members.map((m, i) => {
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const name = m.profile?.username ?? `Joueur ${i + 1}`;
            return (
              <View
                key={m.user_id}
                style={[
                  styles.memberChip,
                  {
                    backgroundColor: m.has_paid_real_stake ? `${accentColor}12` : 'rgba(255,255,255,0.03)',
                    borderColor: m.has_paid_real_stake ? `${accentColor}44` : 'rgba(255,255,255,0.06)',
                    opacity: m.has_paid_real_stake ? 1 : 0.5,
                  },
                ]}
              >
                <Avatar
                  gradient={gradient}
                  size={20}
                  initials={name[0]}
                  avatarUrl={m.profile?.avatar_url}
                />
                <Text style={styles.memberName}>{name.split(' ')[0]}</Text>
                {m.has_paid_real_stake && (
                  <View style={[styles.checkDot, { backgroundColor: accentColor }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* CTA */}
        <Pressable onPress={onAdd} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient
            colors={[accentColor, accentColor2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Zap size={16} color="#0f172a" fill="#0f172a" />
            <Text style={styles.ctaText}>Faire grimper la cagnotte</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  glowBg: {
    backgroundColor: 'rgba(34,211,238,0.03)',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  matchLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  bonusLabel: {
    fontSize: 10,
    color: '#475569',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Progress
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressCount: {
    color: '#f1f5f9',
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  // Members
  members: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#e2e8f0',
  },
  checkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0f172a',
  },
  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
});
