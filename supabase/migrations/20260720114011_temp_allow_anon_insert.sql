-- Temporarily allow anon INSERT for seeding
DROP POLICY IF EXISTS "auth_insert_questions" ON questions;
CREATE POLICY "temp_anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
