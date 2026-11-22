
-- Per-student AI study artifacts and request throttling.
CREATE TABLE IF NOT EXISTS public.ai_study_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('plan','notes','quiz','performance','english')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content text NOT NULL CHECK (char_length(content) <= 50000),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_study_records_user_type_created_idx
  ON public.ai_study_records (user_id, record_type, created_at DESC);
ALTER TABLE public.ai_study_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.ai_study_records TO authenticated;
DROP POLICY IF EXISTS "select_own_ai_study_records" ON public.ai_study_records;
CREATE POLICY "select_own_ai_study_records" ON public.ai_study_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_ai_study_records" ON public.ai_study_records;
CREATE POLICY "insert_own_ai_study_records" ON public.ai_study_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_ai_study_records" ON public.ai_study_records;
CREATE POLICY "delete_own_ai_study_records" ON public.ai_study_records
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_request_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, window_started_at)
);
ALTER TABLE public.ai_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_request_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_request_limit(p_max_requests integer DEFAULT 20)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', now());
  v_count integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.ai_request_limits(user_id, window_started_at, request_count)
  VALUES (v_uid, v_window, 1)
  ON CONFLICT (user_id, window_started_at)
  DO UPDATE SET request_count = ai_request_limits.request_count + 1
  RETURNING request_count INTO v_count;
  DELETE FROM public.ai_request_limits WHERE window_started_at < now() - interval '10 minutes';
  RETURN v_count <= LEAST(GREATEST(p_max_requests, 1), 60);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.consume_ai_request_limit(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_request_limit(integer) TO authenticated;


CREATE TABLE IF NOT EXISTS public.ai_study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  class_level smallint NOT NULL CHECK (class_level BETWEEN 6 AND 12),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 80),
  chapter text NOT NULL CHECK (char_length(chapter) BETWEEN 1 AND 200),
  is_completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, class_level, subject, chapter)
);
ALTER TABLE public.ai_study_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_study_progress TO authenticated;
DROP POLICY IF EXISTS "manage_own_ai_study_progress" ON public.ai_study_progress;
CREATE POLICY "manage_own_ai_study_progress" ON public.ai_study_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
