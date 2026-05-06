import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const API_SPORTS_KEY = Deno.env.get('API_SPORTS_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const FOOTBALL_LEAGUES = [61, 2, 39]; // Ligue 1, Champions League, Premier League
const RUGBY_LEAGUES = [1, 2]; // Top 14, European Rugby

async function fetchFixtures(sport: 'football' | 'rugby', leagueId: number, season: number) {
  const baseUrl = sport === 'football'
    ? 'https://v3.football.api-sports.io'
    : 'https://v1.rugby.api-sports.io';

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = `${baseUrl}/fixtures?league=${leagueId}&season=${season}&from=${today}&to=${nextWeek}`;

  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_SPORTS_KEY },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchLiveFixtures(sport: 'football' | 'rugby') {
  const baseUrl = sport === 'football'
    ? 'https://v3.football.api-sports.io'
    : 'https://v1.rugby.api-sports.io';

  const res = await fetch(`${baseUrl}/fixtures?live=all`, {
    headers: { 'x-apisports-key': API_SPORTS_KEY },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchOdds(sport: 'football' | 'rugby', fixtureId: number) {
  const baseUrl = sport === 'football'
    ? 'https://v3.football.api-sports.io'
    : 'https://v1.rugby.api-sports.io';

  const res = await fetch(`${baseUrl}/odds?fixture=${fixtureId}&bookmaker=8`, {
    headers: { 'x-apisports-key': API_SPORTS_KEY },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.response?.[0] ?? null;
}

function extractOdds(oddsData: any) {
  if (!oddsData) return { odds_home: null, odds_draw: null, odds_away: null };

  const matchWinner = oddsData.bookmakers?.[0]?.bets?.find(
    (b: any) => b.name === 'Match Winner',
  );

  if (!matchWinner) return { odds_home: null, odds_draw: null, odds_away: null };

  const values = matchWinner.values;
  return {
    odds_home: parseFloat(values.find((v: any) => v.value === 'Home')?.odd ?? '0') || null,
    odds_draw: parseFloat(values.find((v: any) => v.value === 'Draw')?.odd ?? '0') || null,
    odds_away: parseFloat(values.find((v: any) => v.value === 'Away')?.odd ?? '0') || null,
  };
}

function mapStatus(apiStatus: string): string {
  const map: Record<string, string> = {
    NS: 'NS', '1H': 'LIVE', HT: 'HT', '2H': 'LIVE', ET: 'LIVE',
    P: 'LIVE', FT: 'FT', AET: 'FT', PEN: 'FT',
    PST: 'PST', CANC: 'CANC', SUSP: 'CANC',
    // Rugby
    'Not Started': 'NS', 'In Progress': 'LIVE', 'Finished': 'FT',
  };
  return map[apiStatus] ?? 'NS';
}

async function syncFootball() {
  const season = new Date().getFullYear();
  const matchesToUpsert = [];

  for (const leagueId of FOOTBALL_LEAGUES) {
    try {
      const data = await fetchFixtures('football', leagueId, season);
      const fixtures = data.response ?? [];

      for (const fx of fixtures) {
        const { fixture, league, teams, goals, score } = fx;
        const oddsData = await fetchOdds('football', fixture.id);
        const odds = extractOdds(oddsData);

        matchesToUpsert.push({
          id: fixture.id,
          sport: 'foot',
          competition: `${league.name} · J${league.round?.replace(/[^0-9]/g, '')}`,
          home_team: teams.home.name,
          away_team: teams.away.name,
          home_logo: teams.home.logo,
          away_logo: teams.away.logo,
          match_date: fixture.date,
          status: mapStatus(fixture.status.short),
          minute: fixture.status.elapsed ?? null,
          home_score: goals.home ?? 0,
          away_score: goals.away ?? 0,
          ...odds,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`Football league ${leagueId} sync failed:`, err);
    }
  }

  if (matchesToUpsert.length > 0) {
    const { error } = await supabase.from('matches').upsert(matchesToUpsert, {
      onConflict: 'id',
    });
    if (error) console.error('Upsert error:', error);
    else console.log(`Synced ${matchesToUpsert.length} football matches`);
  }
}

async function syncLiveMatches() {
  for (const sport of ['football', 'rugby'] as const) {
    try {
      const data = await fetchLiveFixtures(sport);
      const fixtures = data.response ?? [];

      const updates = fixtures.map((fx: any) => ({
        id: fx.fixture?.id ?? fx.id,
        status: 'LIVE',
        minute: fx.fixture?.status?.elapsed ?? fx.status?.timer ?? null,
        home_score: fx.goals?.home ?? fx.scores?.home ?? 0,
        away_score: fx.goals?.away ?? fx.scores?.away ?? 0,
        updated_at: new Date().toISOString(),
      }));

      if (updates.length > 0) {
        await supabase.from('matches').upsert(updates, { onConflict: 'id' });
        console.log(`Updated ${updates.length} live ${sport} matches`);
      }
    } catch (err) {
      console.error(`Live sync failed for ${sport}:`, err);
    }
  }
}

serve(async (req) => {
  const { mode } = await req.json().catch(() => ({ mode: 'full' }));

  if (mode === 'live') {
    await syncLiveMatches();
  } else {
    await syncFootball();
  }

  return new Response(JSON.stringify({ ok: true, mode, ts: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
