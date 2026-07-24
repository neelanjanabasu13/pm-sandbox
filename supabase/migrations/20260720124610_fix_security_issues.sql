-- 1. Force RLS on all public tables so even table owners are subject to policies
ALTER TABLE questions FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE session_responses FORCE ROW LEVEL SECURITY;
ALTER TABLE app_secrets FORCE ROW LEVEL SECURITY;

-- 2. Add CHECK constraint on questions.type to only allow valid values
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('product_sense', 'execution', 'strategy'));

-- 3. Prevent non-service-role users from setting is_daily / daily_date
-- Only the service role (used by edge functions) can feature a question.
-- Authenticated users inserting/updating cannot set is_daily=true themselves.
CREATE OR REPLACE FUNCTION guard_daily_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- service role bypasses RLS and has no auth.uid(); allow it through
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  -- authenticated users cannot set is_daily to true or set daily_date
  IF NEW.is_daily = true THEN
    RAISE EXCEPTION 'You are not allowed to set is_daily directly';
  END IF;
  IF NEW.daily_date IS NOT NULL THEN
    RAISE EXCEPTION 'You are not allowed to set daily_date directly';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS guard_daily_insert ON questions;
CREATE TRIGGER guard_daily_insert
  BEFORE INSERT ON questions
  FOR EACH ROW EXECUTE FUNCTION guard_daily_fields();

DROP TRIGGER IF EXISTS guard_daily_update ON questions;
CREATE TRIGGER guard_daily_update
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION guard_daily_fields();
