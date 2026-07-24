-- Lock down questions INSERT back to authenticated only
DROP POLICY IF EXISTS "temp_anon_insert_questions" ON questions;
CREATE POLICY "auth_insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (true);
