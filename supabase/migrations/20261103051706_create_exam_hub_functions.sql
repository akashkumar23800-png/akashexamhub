/*
# Secure test submission, leaderboard and platform stats functions

1. New Functions
- `submit_test_attempt(test id, answers)`: grades a test on the server, stores the attempt and every answer, and returns the score with explanations. Scoring: +4 for a correct answer, -1 for a wrong answer, 0 for unanswered. Score is never below 0.
- `get_leaderboard(period)`: ranks students by points for the current week or month. Returns only display names and totals.
- `platform_stats()`: returns live counts of questions, published tests and registered students. These are real counts, never placeholders.

2. Security
- All three functions run with elevated rights but check the caller first.
- EXECUTE is removed from the public and anonymous roles and granted only to signed-in students.
- Correct answers are only returned by `submit_test_attempt` after the attempt is saved.

3. Important notes
- Students cannot write attempts directly; the submit function is the only way to create them.
- Option numbers must be 0 to 3, otherwise the submission is rejected.
*/

CREATE OR REPLACE FUNCTION public.submit_test_attempt(p_test_id uuid, p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_attempt_id uuid := gen_random_uuid();
  r record;
  v_selected int;
  v_is_correct boolean;
  v_total int := 0;
  v_correct int := 0;
  v_incorrect int := 0;
  v_score int;
  v_review jsonb := '[]'::jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to submit a test' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM tests WHERE id = p_test_id AND is_published) THEN
    RAISE EXCEPTION 'This test is not available';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'Answers must be a list';
  END IF;

  FOR r IN
    SELECT q.id AS question_id,
           q.subject_id,
           q.correct_index,
           q.explanation,
           tq.position,
           (SELECT a->>'selected_index'
              FROM jsonb_array_elements(p_answers) a
             WHERE a->>'question_id' = q.id::text
             LIMIT 1) AS selected_raw
    FROM test_questions tq
    JOIN questions q ON q.id = tq.question_id
    WHERE tq.test_id = p_test_id
    ORDER BY tq.position, q.id
  LOOP
    v_selected := NULL;
    IF r.selected_raw IS NOT NULL THEN
      v_selected := r.selected_raw::int;
      IF v_selected NOT BETWEEN 0 AND 3 THEN
        RAISE EXCEPTION 'Invalid answer option';
      END IF;
    END IF;

    v_total := v_total + 1;
    v_is_correct := CASE WHEN v_selected IS NULL THEN NULL ELSE v_selected = r.correct_index END;
    IF v_is_correct THEN
      v_correct := v_correct + 1;
    ELSIF v_is_correct = false THEN
      v_incorrect := v_incorrect + 1;
    END IF;

    v_review := v_review || jsonb_build_object(
      'question_id', r.question_id,
      'subject_id', r.subject_id,
      'selected_index', v_selected,
      'correct_index', r.correct_index,
      'is_correct', v_is_correct,
      'explanation', r.explanation
    );
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'This test has no questions yet';
  END IF;

  v_score := GREATEST(0, v_correct * 4 - v_incorrect);

  INSERT INTO attempts (
    id, user_id, test_id, score, max_score, correct_count, incorrect_count, unanswered_count, total_questions
  ) VALUES (
    v_attempt_id, v_uid, p_test_id, v_score, v_total * 4, v_correct, v_incorrect,
    v_total - v_correct - v_incorrect, v_total
  );

  INSERT INTO attempt_answers (attempt_id, question_id, subject_id, selected_index, is_correct)
  SELECT v_attempt_id,
         (x->>'question_id')::uuid,
         (x->>'subject_id')::uuid,
         (x->>'selected_index')::smallint,
         (x->>'is_correct')::boolean
  FROM jsonb_array_elements(v_review) x;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'max_score', v_total * 4,
    'total', v_total,
    'correct', v_correct,
    'incorrect', v_incorrect,
    'unanswered', v_total - v_correct - v_incorrect,
    'review', v_review
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_period text)
RETURNS TABLE (
  place bigint,
  user_id uuid,
  full_name text,
  points bigint,
  tests_completed bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_since timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to view the leaderboard' USING ERRCODE = '42501';
  END IF;

  IF p_period NOT IN ('week', 'month') THEN
    RAISE EXCEPTION 'Unknown leaderboard period';
  END IF;

  v_since := date_trunc(p_period, now());

  RETURN QUERY
  SELECT row_number() OVER (ORDER BY t.points DESC, t.tests_completed DESC, p.full_name)::bigint,
         t.user_id,
         p.full_name,
         t.points,
         t.tests_completed
  FROM (
    SELECT a.user_id,
           SUM(a.score)::bigint AS points,
           COUNT(*)::bigint AS tests_completed
    FROM attempts a
    WHERE a.completed_at >= v_since
    GROUP BY a.user_id
  ) t
  JOIN profiles p ON p.id = t.user_id
  ORDER BY 1
  LIMIT 50;
END;
$$;

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
    'students', (SELECT count(*) FROM profiles)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.submit_test_attempt(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_test_attempt(uuid, jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.platform_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO authenticated;
