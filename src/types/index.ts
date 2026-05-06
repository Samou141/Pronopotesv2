export type Sport = 'foot' | 'rugby';
export type MatchStatus = 'NS' | 'LIVE' | 'HT' | 'FT' | 'PST' | 'CANC';
export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled';
export type Prediction = '1' | 'N' | '2';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  global_balance: number;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  admin_id: string;
  real_stake_amount: number;
  description: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  has_paid_real_stake: boolean;
  virtual_balance: number;
  joined_at: string;
  profile?: Profile;
}

export interface Match {
  id: number;
  sport: Sport;
  competition: string | null;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  home_colors: string[];
  away_colors: string[];
  match_date: string;
  status: MatchStatus;
  minute: number | null;
  home_score: number;
  away_score: number;
  odds_home: number | null;
  odds_draw: number | null;
  odds_away: number | null;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  group_id: string;
  match_id: number;
  prediction: Prediction;
  amount: number;
  potential_gain: number;
  status: BetStatus;
  created_at: string;
  match?: Match;
  profile?: Profile;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  my_balance?: number;
  total_pot?: number;
}
