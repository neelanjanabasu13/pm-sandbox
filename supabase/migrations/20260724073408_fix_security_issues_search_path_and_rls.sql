/*
# Fix security issues: mutable search_path, public SECURITY DEFINER exec, app_secrets RLS

## 1. Function search_path mutability (update_updated_at, guard_daily_fields)
Both functions are defined without an explicit `search_path`, so they resolve
objects against the caller's `search_path` at runtime. This is a mutable
search_path vulnerability: a hostile caller could set `search_path` to a schema
they control and hijack unqualified function/operator calls inside the function
bodies. Fix: redefine both functions with an explicit, trusted `search_path`
pinned to `pg_catalog, public` so unqualified names always resolve to trusted
schemas. Function bodies are otherwise unchanged.

## 2. Public/authenticated can execute SECURITY DEFINER function (guard_daily_fields)
`guard_daily_fields` is a SECURITY DEFINER trigger function (runs with the
owner's privileges). By default Postgres grants EXECUTE to PUBLIC, meaning the
`anon` and `authenticated` roles can invoke it directly via
`/rest/v1/rpc/guard_daily_fields`. It is a trigger function and should never be
invoked via RPC. Fix: REVOKE EXECUTE from PUBLIC and from anon/authenticated,
leaving only the owner (postgres) able to run it (Postgres still calls it as a
trigger regardless of EXECUTE grants). `update_updated_at` is also a trigger
function; we revoke EXECUTE from PUBLIC on it too for the same reason (it was
not flagged because it is not SECURITY DEFINER, but the same hardening applies).

## 3. RLS enabled with no policy on app_secrets
`app_secrets` stores AI provider API keys. RLS is enabled (and forced) but no
policies exist, so the table is correctly locked down for anon/authenticated
clients. However, the missing policy is itself flagged as a security finding.
The table is written to by edge functions using the service role (which bypasses
RLS), and should NEVER be readable or writable by anon/authenticated clients.
Fix: add explicit DENY policies (USING (false) / WITH CHECK (false)) for
anon/authenticated so the intent is unambiguous and the "no policy" finding is
resolved. The service role continues to bypass RLS as before.

## Important notes
1. No data is changed or lost. All changes are metadata (function definitions,
   grants, policies).
2. Trigger functions continue to fire normally — EXECUTE grants do not affect
   trigger invocation by Postgres.
3. The service role still reads/writes `app_secrets` because it bypasses RLS.
*/

-- ── 1. Pin search_path on both functions ──────────────────────────────────
-- update_updated_at: SECURITY INVOKER trigger function (no change to body)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- guard_daily_fields: SECURITY DEFINER trigger function (no change to body)
CREATE OR REPLACE FUNCTION public.guard_daily_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
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
$function$;

-- ── 2. Revoke direct EXECUTE on trigger functions from PUBLIC/anon/auth ────
REVOKE EXECUTE ON FUNCTION public.guard_daily_fields() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_daily_fields() FROM anon;
REVOKE EXECUTE ON FUNCTION public.guard_daily_fields() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM authenticated;

-- ── 3. Explicit DENY policies on app_secrets ───────────────────────────────
-- The table holds API keys and must never be accessible to anon/authenticated
-- clients. These USING (false) / WITH CHECK (false) policies make the lock-down
-- explicit and resolve the "RLS enabled, no policy" finding. The service role
-- bypasses RLS and continues to read/write the table.
DROP POLICY IF EXISTS "deny_select_app_secrets" ON app_secrets;
CREATE POLICY "deny_select_app_secrets" ON app_secrets FOR SELECT
  TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_insert_app_secrets" ON app_secrets;
CREATE POLICY "deny_insert_app_secrets" ON app_secrets FOR INSERT
  TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_update_app_secrets" ON app_secrets;
CREATE POLICY "deny_update_app_secrets" ON app_secrets FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_delete_app_secrets" ON app_secrets;
CREATE POLICY "deny_delete_app_secrets" ON app_secrets FOR DELETE
  TO anon, authenticated USING (false);
