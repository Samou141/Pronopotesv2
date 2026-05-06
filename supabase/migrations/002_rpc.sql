-- Called by the settle-bets edge function to credit winnings
CREATE OR REPLACE FUNCTION increment_virtual_balance(
  p_group_id UUID,
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE group_members
  SET virtual_balance = virtual_balance + p_amount
  WHERE group_id = p_group_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join a group by invite code (atomic: find group + insert member)
CREATE OR REPLACE FUNCTION join_group_by_code(p_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
BEGIN
  SELECT id INTO v_group_id FROM groups WHERE invite_code = UPPER(p_code);

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO group_members (group_id, user_id)
  VALUES (v_group_id, auth.uid())
  ON CONFLICT DO NOTHING;

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a group and automatically add creator as member
CREATE OR REPLACE FUNCTION create_group(p_name TEXT, p_stake DECIMAL DEFAULT 10.0, p_description TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_code TEXT;
  v_group_id UUID;
BEGIN
  -- Generate unique code
  LOOP
    v_code := generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM groups WHERE invite_code = v_code);
  END LOOP;

  INSERT INTO groups (name, invite_code, admin_id, real_stake_amount, description)
  VALUES (p_name, v_code, auth.uid(), p_stake, p_description)
  RETURNING id INTO v_group_id;

  INSERT INTO group_members (group_id, user_id)
  VALUES (v_group_id, auth.uid());

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
