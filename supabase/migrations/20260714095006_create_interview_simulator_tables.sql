/*
# Create Interview Simulator Tables (single-tenant, no auth)

1. Purpose
   - Stores the PM interview question bank (product design + product improvement),
     practice sessions, and per-stage responses for a choose-your-own-adventure
     interview practice simulator.

2. New Tables
   - `questions`: the question bank
     - `id` (uuid, primary key)
     - `text` (text, not null) — the interview question
     - `category` (text, not null) — 'product_design' or 'product_improvement'
     - `difficulty` (text, default 'medium') — 'easy', 'medium', 'hard'
     - `source_companies` (text[]) — companies known to ask this question (optional)
     - `created_at` (timestamptz)
   - `sessions`: a user's practice session for one question
     - `id` (uuid, primary key)
     - `question_id` (uuid, foreign key → questions.id)
     - `browser_id` (text, not null) — anonymous browser identifier from localStorage
     - `current_stage` (text, default 'clarify') — which stage the user is on
     - `status` (text, default 'in_progress') — 'in_progress' or 'completed'
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
   - `session_responses`: the user's selections for each stage within a session
     - `id` (uuid, primary key)
     - `session_id` (uuid, foreign key → sessions.id, cascade delete)
     - `stage` (text, not null) — 'clarify', 'user_groups', 'prioritize_user_groups', 'pain_points', 'prioritize_pain_points', 'solutions', 'prioritize_solutions', 'gtm', 'summary'
     - `items` (jsonb) — array of items the user selected/typed for this stage
     - `prioritization` (jsonb) — ordered array representing the user's ranking
     - `ai_suggestions` (jsonb) — the AI-generated suggestions returned for this stage
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. Security
   - RLS enabled on all three tables.
   - Single-tenant, no auth: policies use `TO anon, authenticated` with `USING (true)`
     because the data is intentionally public/shared (no sign-in screen).
   - Full CRUD for anon + authenticated on all tables.

4. Indexes
   - `sessions` by `browser_id` (for resume functionality)
   - `sessions` by `question_id`
   - `session_responses` by `session_id`
   - `questions` by `category`
*/

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  category text NOT NULL CHECK (category IN ('product_design', 'product_improvement')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source_companies text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  browser_id text NOT NULL,
  current_stage text NOT NULL DEFAULT 'clarify',
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  stage text NOT NULL,
  items jsonb DEFAULT '[]'::jsonb,
  prioritization jsonb DEFAULT '[]'::jsonb,
  ai_suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_browser_id ON sessions(browser_id);
CREATE INDEX IF NOT EXISTS idx_sessions_question_id ON sessions(question_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: questions (read-only for anon, full CRUD for simplicity since no auth)
DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

-- RLS Policies: sessions
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

-- RLS Policies: session_responses
DROP POLICY IF EXISTS "anon_select_session_responses" ON session_responses;
CREATE POLICY "anon_select_session_responses" ON session_responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_session_responses" ON session_responses;
CREATE POLICY "anon_insert_session_responses" ON session_responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_session_responses" ON session_responses;
CREATE POLICY "anon_update_session_responses" ON session_responses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_session_responses" ON session_responses;
CREATE POLICY "anon_delete_session_responses" ON session_responses FOR DELETE
  TO anon, authenticated USING (true);

-- Updated_at trigger for sessions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_updated ON sessions;
CREATE TRIGGER trg_sessions_updated
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_session_responses_updated ON session_responses;
CREATE TRIGGER trg_session_responses_updated
  BEFORE UPDATE ON session_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
