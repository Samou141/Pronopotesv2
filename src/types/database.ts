export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          global_balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          global_balance?: number;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          global_balance?: number;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          admin_id: string;
          real_stake_amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          invite_code: string;
          admin_id: string;
          real_stake_amount?: number;
          description?: string | null;
        };
        Update: {
          name?: string;
          real_stake_amount?: number;
          description?: string | null;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          has_paid_real_stake: boolean;
          virtual_balance: number;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          has_paid_real_stake?: boolean;
          virtual_balance?: number;
        };
        Update: {
          has_paid_real_stake?: boolean;
          virtual_balance?: number;
        };
      };
      matches: {
        Row: {
          id: number;
          sport: string;
          competition: string | null;
          home_team: string;
          away_team: string;
          home_logo: string | null;
          away_logo: string | null;
          home_colors: string[];
          away_colors: string[];
          match_date: string;
          status: string;
          minute: number | null;
          home_score: number;
          away_score: number;
          odds_home: number | null;
          odds_draw: number | null;
          odds_away: number | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'updated_at'> & {
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['matches']['Row']>;
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          match_id: number;
          prediction: string;
          amount: number;
          potential_gain: number;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          group_id: string;
          match_id: number;
          prediction: string;
          amount: number;
          potential_gain: number;
          status?: string;
        };
        Update: {
          status?: string;
        };
      };
    };
    Functions: {
      join_group_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
      create_group: {
        Args: { p_name: string; p_stake?: number; p_description?: string };
        Returns: string;
      };
      increment_virtual_balance: {
        Args: { p_group_id: string; p_user_id: string; p_amount: number };
        Returns: void;
      };
    };
  };
}
