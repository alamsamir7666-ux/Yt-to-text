-- ============================================
-- TranscriptAI Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Users table (synced from Kinde)
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kinde_id    TEXT        UNIQUE NOT NULL,
  email       TEXT,
  name        TEXT,
  avatar_url  TEXT,
  plan        TEXT        DEFAULT 'free', -- 'free' | 'pro'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion history
CREATE TABLE conversions (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url                  TEXT        NOT NULL,
  video_id                   TEXT        NOT NULL,
  video_title                TEXT,
  video_thumbnail            TEXT,
  video_duration             INTEGER,    -- seconds
  channel_name               TEXT,
  channel_id                 TEXT,
  transcript                 TEXT        NOT NULL,
  transcript_with_timestamps JSONB,      -- array of {start, duration, text}
  language                   TEXT        DEFAULT 'en',
  word_count                 INTEGER,
  char_count                 INTEGER,
  method                     TEXT        DEFAULT 'captions', -- 'captions' | 'ytdlp' | 'whisper'
  status                     TEXT        DEFAULT 'completed', -- 'processing' | 'completed' | 'failed'
  error_message              TEXT,
  created_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversions_user_id    ON conversions(user_id);
CREATE INDEX idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX idx_conversions_video_id   ON conversions(video_id);
CREATE INDEX idx_users_kinde_id         ON users(kinde_id);

-- Full text search index on transcript
CREATE INDEX idx_conversions_transcript_fts
  ON conversions
  USING gin(to_tsvector('english', transcript));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses all RLS (used in API routes via service key)
-- These permissive policies allow API-level filtering to handle auth

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "conversions_select_own"
  ON conversions FOR SELECT
  USING (true);

CREATE POLICY "conversions_insert"
  ON conversions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "conversions_delete"
  ON conversions FOR DELETE
  USING (true);
