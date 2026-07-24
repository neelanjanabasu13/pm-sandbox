/*
# Rebuild schema for daily question + unlimited practice + dashboard

Adds auth support, typed question categories, daily rotation, session
tracking columns (pitch, score, feedback), and owner-scoped RLS.
*/

-- ── questions: add new columns ────────────────────────────────────
ALTER TABLE questions ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'product_sense';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_company text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS interview_type text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_daily boolean NOT NULL DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS daily_date date;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS chip_options jsonb DEFAULT '{}'::jsonb;

-- Drop old CHECK constraints so new type values work
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_category_check') THEN
    ALTER TABLE questions DROP CONSTRAINT questions_category_check;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'questions_difficulty_check') THEN
    ALTER TABLE questions DROP CONSTRAINT questions_difficulty_check;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'category'
    AND is_nullable = 'NO') THEN
    ALTER TABLE questions ALTER COLUMN category DROP NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_questions_daily ON questions(is_daily, daily_date);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- ── sessions: add columns ─────────────────────────────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS pitch_text text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS score integer;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS grader_feedback text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS graded_at timestamptz;

-- Set default on user_id now that the column exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'user_id'
    AND column_default IS NULL) THEN
    ALTER TABLE sessions ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- Update status CHECK to include 'graded'
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_status_check') THEN
    ALTER TABLE sessions DROP CONSTRAINT sessions_status_check;
  END IF;
END $$;
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'graded'));

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ── RLS: questions (public read, auth write) ──────────────────────
DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
DROP POLICY IF EXISTS "auth_insert_questions" ON questions;
CREATE POLICY "auth_insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
DROP POLICY IF EXISTS "auth_update_questions" ON questions;
CREATE POLICY "auth_update_questions" ON questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
DROP POLICY IF EXISTS "auth_delete_questions" ON questions;
CREATE POLICY "auth_delete_questions" ON questions FOR DELETE
  TO authenticated USING (true);

-- ── RLS: sessions (owner-scoped) ──────────────────────────────────
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;

DROP POLICY IF EXISTS "select_own_sessions" ON sessions;
CREATE POLICY "select_own_sessions" ON sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON sessions;
CREATE POLICY "insert_own_sessions" ON sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON sessions;
CREATE POLICY "update_own_sessions" ON sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON sessions;
CREATE POLICY "delete_own_sessions" ON sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── RLS: session_responses (owner-scoped via parent) ─────────────
DROP POLICY IF EXISTS "anon_select_session_responses" ON session_responses;
DROP POLICY IF EXISTS "anon_insert_session_responses" ON session_responses;
DROP POLICY IF EXISTS "anon_update_session_responses" ON session_responses;
DROP POLICY IF EXISTS "anon_delete_session_responses" ON session_responses;

DROP POLICY IF EXISTS "select_own_responses" ON session_responses;
CREATE POLICY "select_own_responses" ON session_responses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_responses.session_id AND sessions.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_responses" ON session_responses;
CREATE POLICY "insert_own_responses" ON session_responses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_responses.session_id AND sessions.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_responses" ON session_responses;
CREATE POLICY "update_own_responses" ON session_responses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_responses.session_id AND sessions.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_responses.session_id AND sessions.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_responses" ON session_responses;
CREATE POLICY "delete_own_responses" ON session_responses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_responses.session_id AND sessions.user_id = auth.uid())
  );
