import { useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { useAuthStore } from '@store/auth';
import type { Profile } from '@/types';

export function useAuth() {
  const { session, user, profile, loading, setSession, setProfile, setLoading, clear } = useAuthStore();

  useEffect(() => {
    // Hydrate session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else { clear(); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);
      if (profileError) throw profileError;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    clear();
  }

  async function updateProfile(updates: Partial<Pick<Profile, 'username' | 'avatar_url'>>) {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  }

  return { session, user, profile, loading, signIn, signUp, signOut, updateProfile };
}
