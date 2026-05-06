import { BarChart3, TrendingUp, Target, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@hooks/useAuth';
import { Card } from '@ui/Card';

const ACCENT = '#22d3ee';

function StatCard({ icon: Icon, label, value, sub, color = '#22d3ee' }: any) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {sub && <Text style={styles.statSub}>{sub}</Text>}
      </View>
    </Card>
  );
}

export default function StatsScreen() {
  const { profile } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Mes Stats</Text>
        <Text style={styles.sub}>Historique de tes pronostics</Text>

        <View style={styles.grid}>
          <StatCard
            icon={Target}
            label="Paris gagnés"
            value="—"
            sub="En attente de données"
            color="#22d3ee"
          />
          <StatCard
            icon={TrendingUp}
            label="Taux de réussite"
            value="—"
            color="#34d399"
          />
          <StatCard
            icon={Trophy}
            label="Jetons gagnés"
            value="—"
            color="#fbbf24"
          />
          <StatCard
            icon={BarChart3}
            label="Série en cours"
            value="—"
            color="#f97316"
          />
        </View>

        <Card>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonTitle}>Statistiques avancées</Text>
            <Text style={styles.comingSoonText}>
              Graphs de performance, analyse par sport, et comparaison avec tes potes — bientôt disponible.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  sub: { fontSize: 13, color: '#64748b' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%' },
  statContent: { padding: 16, gap: 8, alignItems: 'center' },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center' },
  statSub: { fontSize: 10, color: '#334155', textAlign: 'center' },
  comingSoon: { padding: 24, alignItems: 'center', gap: 12 },
  comingSoonTitle: { fontSize: 17, fontWeight: '700', color: '#64748b' },
  comingSoonText: { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20 },
});
