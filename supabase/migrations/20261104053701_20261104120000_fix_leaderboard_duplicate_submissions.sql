/*
# Prevent duplicate test submissions from inflating leaderboard scores

1. Modified Functions
- `get_leaderboard(period)` now groups attempts by student and test before calculating totals.
- For a student who submitted the same test more than once, only the highest score for that test contributes to leaderboard points.
- The test is counted once in `tests_completed`.

2. Data Safety
- No rows are deleted or changed.
- Existing attempt history remains available to the student and platform.
- This protects leaderboard calculations for both existing duplicate attempts and future submissions.

3. Security
- The function remains `SECURITY DEFINER` with the existing fixed `search_path`.
- Existing authenticated-only execution grants are preserved.

4. Important Notes
- Students may still submit a test again where the application allows it.
- Repeated submissions no longer multiply leaderboard points or completed-test counts.
*/

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
    SELECT attempts_by_test.user_id,
           SUM(attempts_by_test.best_score)::bigint AS points,
           COUNT(*)::bigint AS tests_completed
    FROM (
      SELECT a.user_id, a.test_id, MAX(a.score)::bigint AS best_score
      FROM attempts a
      WHERE a.completed_at >= v_since
      GROUP BY a.user_id, a.test_id
    ) attempts_by_test
    GROUP BY attempts_by_test.user_id
  ) t
  JOIN profiles p ON p.id = t.user_id
  ORDER BY 1
  LIMIT 50;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;