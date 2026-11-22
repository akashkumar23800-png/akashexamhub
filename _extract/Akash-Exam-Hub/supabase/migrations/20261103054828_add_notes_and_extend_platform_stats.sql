/*
# Add personal notes and extend platform statistics

1. New Tables
- `notes`: a student's own written notes.
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to the signed-in student)
  - `title` (text, required, up to 200 characters)
  - `body` (text, up to 50,000 characters)
  - `created_at` and `updated_at` (timestamps)

2. Modified Functions
- `platform_stats()` now also returns `notes_total` (all notes ever created) and `notes_today` (notes created since midnight UTC). Only counts are returned, never note content.

3. Security
- Row level security is enabled on `notes`.
- Signed-in students get SELECT, INSERT, UPDATE and DELETE on `notes`, and each action is limited to rows they own through four separate policies.
- `platform_stats()` keeps its existing access rules: signed-in students only.

4. Important notes
- Existing data is not changed.
*/

CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 50000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_id_updated_idx ON public.notes (user_id, updated_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;

DROP POLICY IF EXISTS "select_own_notes" ON public.notes;
CREATE POLICY "select_own_notes" ON public.notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON public.notes;
CREATE POLICY "insert_own_notes" ON public.notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON public.notes;
CREATE POLICY "update_own_notes" ON public.notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON public.notes;
CREATE POLICY "delete_own_notes" ON public.notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'questions', (SELECT count(*) FROM questions),
    'tests', (SELECT count(*) FROM tests WHERE is_published),
    'students', (SELECT count(*) FROM profiles),
    'notes_total', (SELECT count(*) FROM notes),
    'notes_today', (SELECT count(*) FROM notes WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.platform_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO authenticated;
