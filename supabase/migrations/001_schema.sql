-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  global_balance INTEGER DEFAULT 1000 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── GROUPS ──────────────────────────────────────────────────────────────────
CREATE TABLE groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  real_stake_amount DECIMAL DEFAULT 10.0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view their groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admin can update their group" ON groups
  FOR UPDATE USING (auth.uid() = admin_id);

-- Generate a unique 6-char invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ─── GROUP MEMBERS ───────────────────────────────────────────────────────────
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  has_paid_real_stake BOOLEAN DEFAULT false,
  virtual_balance INTEGER DEFAULT 1000 NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group membership" ON group_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update member payment status" ON group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_members.group_id AND admin_id = auth.uid()
    )
  );

-- ─── MATCHES ─────────────────────────────────────────────────────────────────
CREATE TABLE matches (
  id BIGINT PRIMARY KEY,
  sport TEXT NOT NULL CHECK (sport IN ('foot', 'rugby')),
  competition TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  home_colors TEXT[] DEFAULT ARRAY['#1e293b', '#334155'],
  away_colors TEXT[] DEFAULT ARRAY['#1e293b', '#334155'],
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'NS' CHECK (status IN ('NS', 'LIVE', 'HT', 'FT', 'PST', 'CANC')),
  minute INTEGER,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  odds_home DECIMAL,
  odds_draw DECIMAL,
  odds_away DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

-- ─── BETS ────────────────────────────────────────────────────────────────────
CREATE TABLE bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  group_id UUID REFERENCES groups(id) NOT NULL,
  match_id BIGINT REFERENCES matches(id) NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('1', 'N', '2')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  potential_gain INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, group_id, match_id)
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bets in their groups" ON bets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = bets.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can place their own bets" ON bets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = bets.group_id AND user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = bets.match_id AND status = 'NS'
    )
  );

-- Deduct virtual balance when bet is placed
CREATE OR REPLACE FUNCTION deduct_bet_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE group_members
  SET virtual_balance = virtual_balance - NEW.amount
  WHERE group_id = NEW.group_id AND user_id = NEW.user_id;

  IF NOT FOUND OR (
    SELECT virtual_balance FROM group_members
    WHERE group_id = NEW.group_id AND user_id = NEW.user_id
  ) < 0 THEN
    RAISE EXCEPTION 'Insufficient virtual balance';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bet_placed
  AFTER INSERT ON bets
  FOR EACH ROW EXECUTE FUNCTION deduct_bet_amount();

-- ─── REALTIME ────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_bets_group_match ON bets(group_id, match_id);
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
