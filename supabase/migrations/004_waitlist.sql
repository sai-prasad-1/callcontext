-- =============================================
-- CallContext Waitlist Table
-- =============================================
-- Add waitlist functionality for landing page

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  business_name TEXT,
  business_type TEXT, -- e.g., 'restaurant', 'retail', 'service', 'other'
  referral_code TEXT UNIQUE, -- For referral program
  referral_source TEXT, -- Where they heard about us
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'converted', 'declined')),
  position INTEGER, -- Position in waitlist
  metadata JSONB DEFAULT '{}', -- Additional data (UTM params, etc.)
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Index for status filtering
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- Index for position ordering
CREATE INDEX idx_waitlist_position ON waitlist(position) WHERE position IS NOT NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM waitlist WHERE referral_code = NEW.referral_code) LOOP
      NEW.referral_code := generate_referral_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_set_referral_code
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (for waitlist signups)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated shop owners can view waitlist
CREATE POLICY "Shop owners can view waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.owner_id = auth.uid()
    )
  );
