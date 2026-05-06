import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@lib/supabase';
import type { Match } from '@/types';

interface UseMatchesOptions {
  status?: Match['status'] | Match['status'][];
  sport?: Match['sport'];
  limit?: number;
}

export function useMatches({ status, sport, limit = 20 }: UseMatchesOptions = {}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true })
      .limit(limit);

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      query = query.in('status', statuses);
    }
    if (sport) query = query.eq('sport', sport);

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setMatches((data ?? []) as Match[]);
    }
    setLoading(false);
  }, [status, sport, limit]);

  useEffect(() => {
    fetchMatches();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('matches-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setMatches((prev) =>
            prev.map((m) => (m.id === (payload.new as Match).id ? (payload.new as Match) : m)),
          );
        } else if (payload.eventType === 'INSERT') {
          setMatches((prev) => [payload.new as Match, ...prev].sort(
            (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
          ));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMatches]);

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const upcomingMatches = matches.filter((m) => m.status === 'NS');
  const finishedMatches = matches.filter((m) => m.status === 'FT');

  return { matches, liveMatches, upcomingMatches, finishedMatches, loading, error, refetch: fetchMatches };
}
