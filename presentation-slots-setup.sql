-- Create presentation_slots table for final presentation registration
-- Run this in Supabase SQL Editor
-- PUBLIC ACCESS - no login required

-- Drop old table if exists (in case of schema change)
DROP TABLE IF EXISTS presentation_slots;

CREATE TABLE presentation_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  presenter_name text NOT NULL,  -- Free text: name of presenter(s)
  topic text NOT NULL,
  presentation_date date NOT NULL CHECK (presentation_date IN ('2025-01-27', '2025-02-03')),
  group_members text,  -- Optional: additional group members as free text
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE presentation_slots ENABLE ROW LEVEL SECURITY;

-- Policy: ANYONE can view all slots (public read)
CREATE POLICY "Anyone can view presentation slots"
  ON presentation_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: ANYONE can insert slots (public write)
CREATE POLICY "Anyone can create presentation slots"
  ON presentation_slots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: ANYONE can delete slots (for simplicity - could be restricted later)
CREATE POLICY "Anyone can delete presentation slots"
  ON presentation_slots
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_presentation_slots_date ON presentation_slots(presentation_date);
