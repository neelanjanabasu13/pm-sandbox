ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS interview_date text;

-- Allow authenticated users to insert questions they authored
DROP POLICY IF EXISTS auth_insert_questions ON questions;
CREATE POLICY auth_insert_questions ON questions FOR INSERT
  TO authenticated WITH CHECK (submitted_by = auth.uid());

-- Allow users to update/delete their own submitted questions
DROP POLICY IF EXISTS auth_update_questions ON questions;
CREATE POLICY auth_update_questions ON questions FOR UPDATE
  TO authenticated USING (submitted_by = auth.uid()) WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS auth_delete_questions ON questions;
CREATE POLICY auth_delete_questions ON questions FOR DELETE
  TO authenticated USING (submitted_by = auth.uid());
