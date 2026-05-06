import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@miblanchard/react-native-slider';
import { TeamCrest } from '@components/TeamCrest';
import type { Match, Prediction } from '@/types';

interface BetModalProps {
  match: Match | null;
  groupId: string;
  virtualBalance: number;
  initialPrediction?: Prediction;
  accentColor?: string;
  accentColor2?: string;
  onConfirm: (matchId: number, prediction: Prediction, amount: number) => Promise<void>;
  onClose: () => void;
}

const PREDICTION_LABELS: Record<Prediction, (m: Match) => string> = {
  '1': (m) => m.home_team,
  'N': () => 'Match Nul',
  '2': (m) => m.away_team,
};

export function BetModal({
  match,
  groupId,
  virtualBalance,
  initialPrediction = '1',
  accentColor = '#22d3ee',
  accentColor2 = '#06b6d4',
  onConfirm,
  onClose,
}: BetModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '80%'], []);

  const [prediction, setPrediction] = useState<Prediction>(initialPrediction);
  const [amount, setAmount] = useState(Math.min(100, Math.floor(virtualBalance * 0.1)));
  const [loading, setLoading] = useState(false);

  const maxBet = Math.min(virtualBalance, 500);

  const selectedOdd =
    prediction === '1' ? match?.odds_home :
    prediction === 'N' ? match?.odds_draw :
    match?.odds_away;

  const potentialGain = selectedOdd ? Math.floor(amount * selectedOdd) : 0;
  const profit = potentialGain - amount;

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  const handleConfirm = async () => {
    if (!match || loading) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await onConfirm(match.id, prediction, amount);
      bottomSheetRef.current?.close();
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />,
    [],
  );

  if (!match) return null;

  const PREDS: Prediction[] = ['1', 'N', '2'];
  const odds = [match.odds_home, match.odds_draw, match.odds_away];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.container}>
        {/* Match info */}
        <View style={styles.matchInfo}>
          <TeamCrest colors={match.home_colors} label={match.home_team.slice(0, 3)} size={36} />
          <Text style={styles.matchLabel} numberOfLines={1}>
            {match.home_team} <Text style={styles.vs}>vs</Text> {match.away_team}
          </Text>
          <TeamCrest colors={match.away_colors} label={match.away_team.slice(0, 3)} size={36} />
        </View>

        {/* Prediction selector */}
        <View>
          <Text style={styles.sectionLabel}>Ton pronostic</Text>
          <View style={styles.predRow}>
            {PREDS.map((p, i) => {
              const odd = odds[i];
              const selected = prediction === p;
              return selected ? (
                <LinearGradient
                  key={p}
                  colors={[accentColor, accentColor2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.predBtn}
                >
                  <Text style={[styles.predLabel, { color: '#0f172a' }]}>{p}</Text>
                  <Text style={[styles.predTeam, { color: '#0f172a' }]} numberOfLines={1}>
                    {PREDICTION_LABELS[p](match)}
                  </Text>
                  {odd != null && (
                    <Text style={[styles.predOdd, { color: '#0f172a', opacity: 0.75 }]}>×{odd.toFixed(2)}</Text>
                  )}
                </LinearGradient>
              ) : (
                <Pressable
                  key={p}
                  onPress={() => { setPrediction(p); Haptics.selectionAsync(); }}
                  style={styles.predBtn}
                >
                  <Text style={styles.predLabel}>{p}</Text>
                  <Text style={styles.predTeam} numberOfLines={1}>
                    {PREDICTION_LABELS[p](match)}
                  </Text>
                  {odd != null && (
                    <Text style={styles.predOdd}>×{odd.toFixed(2)}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Amount slider */}
        <View style={styles.amountSection}>
          <View style={styles.amountHeader}>
            <Text style={styles.sectionLabel}>Mise</Text>
            <Text style={[styles.amountDisplay, { color: accentColor }]}>{amount} jetons</Text>
          </View>
          <Slider
            value={amount}
            minimumValue={10}
            maximumValue={maxBet}
            step={10}
            onValueChange={(v) => setAmount(Array.isArray(v) ? v[0] : v)}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor={accentColor}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>10</Text>
            <Text style={styles.sliderLabel}>Max: {maxBet}</Text>
          </View>

          {/* Quick amount buttons */}
          <View style={styles.quickAmounts}>
            {[50, 100, 200, maxBet].map((v) => (
              <Pressable
                key={v}
                onPress={() => { setAmount(Math.min(v, maxBet)); Haptics.selectionAsync(); }}
                style={[styles.quickBtn, amount === v && { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}55` }]}
              >
                <Text style={[styles.quickBtnText, amount === v && { color: accentColor }]}>
                  {v === maxBet ? 'MAX' : v}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Gain recap */}
        <View style={[styles.gainRecap, { borderColor: `${accentColor}33`, backgroundColor: `${accentColor}08` }]}>
          <View style={styles.gainRow}>
            <Text style={styles.gainLabel}>Mise</Text>
            <Text style={styles.gainValue}>{amount} 🪙</Text>
          </View>
          <View style={styles.gainRow}>
            <Text style={styles.gainLabel}>Cote</Text>
            <Text style={styles.gainValue}>×{selectedOdd?.toFixed(2) ?? '—'}</Text>
          </View>
          <View style={[styles.gainRow, styles.gainRowTotal]}>
            <Text style={[styles.gainLabel, { color: '#f1f5f9', fontWeight: '600' }]}>Gain potentiel</Text>
            <Text style={[styles.gainValue, { color: accentColor, fontSize: 18 }]}>+{potentialGain} 🪙</Text>
          </View>
          <Text style={styles.profitLine}>
            Profit net : <Text style={{ color: profit > 0 ? '#4ade80' : '#f87171' }}>+{profit} jetons</Text>
          </Text>
        </View>

        {/* Confirm button */}
        <Pressable onPress={handleConfirm} disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
          <LinearGradient
            colors={[accentColor, accentColor2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmBtn}
          >
            <Zap size={18} color="#0f172a" fill="#0f172a" />
            <Text style={styles.confirmText}>
              {loading ? 'Validation...' : `Confirmer · ${amount} jetons`}
            </Text>
          </LinearGradient>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  vs: {
    color: '#475569',
    fontWeight: '400',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  predRow: {
    flexDirection: 'row',
    gap: 8,
  },
  predBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  predLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
  predTeam: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  predOdd: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  amountSection: {
    gap: 8,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountDisplay: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 11,
    color: '#475569',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  gainRecap: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  gainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gainRowTotal: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  gainLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  gainValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  profitLine: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
});
