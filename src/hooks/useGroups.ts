import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useAuthStore } from '@store/auth';
import type { Group, GroupMember, Profile, Bet } from '@/types';

export interface GroupWithDetails extends Group {
  members: (GroupMember & { profile: Profile })[];
  my_member?: GroupMember;
}

export function useGroups() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups (
          id, name, invite_code, admin_id, real_stake_amount, description, created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) { setError(error.message); setLoading(false); return; }

    const groupIds = (data ?? []).map((gm: any) => gm.group_id);
    if (groupIds.length === 0) { setGroups([]); setLoading(false); return; }

    const { data: membersData } = await supabase
      .from('group_members')
      .select(`
        group_id, user_id, has_paid_real_stake, virtual_balance, joined_at,
        profiles (id, username, avatar_url, global_balance)
      `)
      .in('group_id', groupIds);

    const groupMap: Record<string, GroupWithDetails> = {};
    for (const gm of data ?? []) {
      const g = (gm as any).groups as Group;
      if (!g) continue;
      groupMap[g.id] = { ...g, members: [] };
    }

    for (const m of membersData ?? []) {
      const member = m as any;
      if (groupMap[member.group_id]) {
        groupMap[member.group_id].members.push({
          group_id: member.group_id,
          user_id: member.user_id,
          has_paid_real_stake: member.has_paid_real_stake,
          virtual_balance: member.virtual_balance,
          joined_at: member.joined_at,
          profile: member.profiles as Profile,
        });
      }
    }

    const result = Object.values(groupMap).map((g) => ({
      ...g,
      my_member: g.members.find((m) => m.user_id === user.id),
    }));

    setGroups(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  async function createGroup(name: string, stake: number = 10, description?: string) {
    const { data, error } = await supabase.rpc('create_group', {
      p_name: name,
      p_stake: stake,
      p_description: description ?? null,
    });
    if (error) throw error;
    await fetchGroups();
    return data as string;
  }

  async function joinGroup(code: string) {
    const { data, error } = await supabase.rpc('join_group_by_code', { p_code: code.toUpperCase() });
    if (error) throw error;
    await fetchGroups();
    return data as string;
  }

  async function markPaid(groupId: string, userId: string, paid: boolean) {
    const { error } = await supabase
      .from('group_members')
      .update({ has_paid_real_stake: paid })
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
    await fetchGroups();
  }

  return { groups, loading, error, refetch: fetchGroups, createGroup, joinGroup, markPaid };
}

export function useGroupBets(groupId: string, matchId?: number) {
  const [bets, setBets] = useState<(Bet & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let query = supabase
      .from('bets')
      .select('*, profiles(id, username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (matchId) query = query.eq('match_id', matchId);

    const { data } = await query;
    setBets((data ?? []).map((b: any) => ({ ...b, profile: b.profiles })));
    setLoading(false);
  }, [groupId, matchId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function placeBet(matchId: number, prediction: string, amount: number, odds: number) {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    const potentialGain = Math.floor(amount * odds);
    const { error } = await supabase.from('bets').insert({
      user_id: user.id,
      group_id: groupId,
      match_id: matchId,
      prediction,
      amount,
      potential_gain: potentialGain,
    });
    if (error) throw error;
    await fetch();
  }

  return { bets, loading, refetch: fetch, placeBet };
}
