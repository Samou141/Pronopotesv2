import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function getWinnerPrediction(homeScore: number, awayScore: number): '1' | 'N' | '2' {
  if (homeScore > awayScore) return '1';
  if (awayScore > homeScore) return '2';
  return 'N';
}

serve(async () => {
  // Find all FT matches with pending bets
  const { data: finishedMatches, error: matchErr } = await supabase
    .from('matches')
    .select('id, home_score, away_score, status')
    .eq('status', 'FT');

  if (matchErr) {
    return new Response(JSON.stringify({ error: matchErr.message }), { status: 500 });
  }

  let settled = 0;
  let errors = 0;

  for (const match of finishedMatches ?? []) {
    const result = getWinnerPrediction(match.home_score, match.away_score);

    const { data: pendingBets, error: betErr } = await supabase
      .from('bets')
      .select('id, user_id, group_id, prediction, potential_gain')
      .eq('match_id', match.id)
      .eq('status', 'pending');

    if (betErr || !pendingBets?.length) continue;

    for (const bet of pendingBets) {
      const won = bet.prediction === result;

      const { error: updateErr } = await supabase
        .from('bets')
        .update({ status: won ? 'won' : 'lost' })
        .eq('id', bet.id);

      if (updateErr) {
        errors++;
        continue;
      }

      if (won) {
        // Credit winnings to group virtual balance
        const { error: creditErr } = await supabase.rpc('increment_virtual_balance', {
          p_group_id: bet.group_id,
          p_user_id: bet.user_id,
          p_amount: bet.potential_gain,
        });

        if (creditErr) {
          console.error('Credit error:', creditErr);
          errors++;
        } else {
          settled++;
        }
      } else {
        settled++;
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, settled, errors, ts: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
