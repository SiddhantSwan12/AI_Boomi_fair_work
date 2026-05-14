-- FairWork Migration 007: Merkle-Verified Juror Profiles
-- Run this in the Supabase SQL editor.

-- Temporary staging table: holds tree data between prepare-anchor and anchor calls.
-- Rows expire after 30 minutes and are deleted on successful anchor.
CREATE TABLE IF NOT EXISTS juror_pending (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet      TEXT NOT NULL,
  root_hex    TEXT NOT NULL,
  leaf_hashes TEXT[] NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (wallet, root_hex)
);

-- Permanent juror profile table.
-- A row is ONLY inserted after the anchor tx is confirmed on Polygon Amoy.
-- No partial/unverified rows ever exist here.
CREATE TABLE IF NOT EXISTS juror_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet           TEXT NOT NULL UNIQUE,
  display_name     TEXT NOT NULL,
  expertise        TEXT[],
  bio              TEXT,
  experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  credential_root  TEXT NOT NULL,
  leaf_hashes      TEXT[] NOT NULL,
  anchor_tx        TEXT NOT NULL,
  anchored_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
