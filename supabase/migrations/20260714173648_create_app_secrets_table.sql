/*
# Create app_secrets table for AI provider keys

1. New Tables
- `app_secrets` — stores API keys for AI providers (Gemini, OpenAI, Anthropic)
  - `name` (text, primary key) — secret name e.g. 'GEMINI_API_KEY'
  - `value` (text, not null) — the secret value
  - `created_at` (timestamp)
2. Security
- RLS enabled with NO policies — only the service_role (which bypasses RLS) can read/write.
  anon and authenticated get zero rows, so the key is never exposed to the client.
3. Notes
- Secrets are managed via the Supabase dashboard / edge function secrets, not hardcoded here.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;
