/*
# Akash Exam Hub core schema

1. New Tables
- `profiles`: one row per student, created automatically when an account is created. Holds the display name shown on the leaderboard.
- `subjects`: the practice subject catalogue (Physics, Chemistry, Mathematics, ...).
- `questions`: multiple-choice question bank. Each question has exactly 4 options.
- `tests`: practice tests and live/mock tests. Live tests can carry an admin-configured date and time.
- `test_questions`: links each test to its questions in order.
- `study_materials`: NCERT notes, important questions, PYQs, sample papers etc. by class (6-12) and medium (English/Hindi).
- `attempts`: one row per submitted test by a student.
- `attempt_answers`: one row per question in each submitted attempt.

2. Security
- Row level security is enabled on every table.
- Students can read the catalogue (subjects, questions without answers, published tests and published study materials).
- Students can read only their own profile and their own attempts.
- The correct answer and explanation columns are NOT granted to students. They are only revealed by the submit function after a test is submitted.
- Students cannot insert, update or delete rows directly. Attempts are created only through a secure server-side function.

3. Important notes
- Foreign keys on attempts and answers use NO ACTION so deleting a question or test cannot silently erase student results.
- Tests default to unpublished so newly added content is never shown to students by accident.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT 'Student',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  chapter text,
  question_text text NOT NULL,
  options jsonb NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4),
  correct_index smallint NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation text,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_subject_id_idx ON questions (subject_id);

CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject_id uuid REFERENCES subjects(id),
  kind text NOT NULL DEFAULT 'practice' CHECK (kind IN ('practice', 'live')),
  duration_minutes int NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  scheduled_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tests_subject_id_idx ON tests (subject_id);

CREATE TABLE IF NOT EXISTS test_questions (
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id),
  position int NOT NULL DEFAULT 0,
  PRIMARY KEY (test_id, question_id)
);
CREATE INDEX IF NOT EXISTS test_questions_question_id_idx ON test_questions (question_id);

CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN (
    'ncert_notes', 'important_questions', 'topper_notes', 'chapter_mcqs',
    'revision_notes', 'previous_year_questions', 'sample_papers'
  )),
  class_level smallint NOT NULL CHECK (class_level BETWEEN 6 AND 12),
  medium text NOT NULL CHECK (medium IN ('English', 'Hindi')),
  body text,
  content_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id),
  score int NOT NULL,
  max_score int NOT NULL,
  correct_count int NOT NULL,
  incorrect_count int NOT NULL,
  unanswered_count int NOT NULL,
  total_questions int NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attempts_user_completed_idx ON attempts (user_id, completed_at);
CREATE INDEX IF NOT EXISTS attempts_test_id_idx ON attempts (test_id);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  selected_index smallint CHECK (selected_index BETWEEN 0 AND 3),
  is_correct boolean
);
CREATE INDEX IF NOT EXISTS attempt_answers_attempt_id_idx ON attempt_answers (attempt_id);
CREATE INDEX IF NOT EXISTS attempt_answers_question_id_idx ON attempt_answers (question_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

GRANT SELECT ON subjects TO authenticated;
DROP POLICY IF EXISTS "select_subjects" ON subjects;
CREATE POLICY "select_subjects" ON subjects FOR SELECT
  TO authenticated USING (true);

GRANT SELECT (id, subject_id, chapter, question_text, options, difficulty, created_at) ON questions TO authenticated;
DROP POLICY IF EXISTS "select_questions" ON questions;
CREATE POLICY "select_questions" ON questions FOR SELECT
  TO authenticated USING (true);

GRANT SELECT ON tests TO authenticated;
DROP POLICY IF EXISTS "select_published_tests" ON tests;
CREATE POLICY "select_published_tests" ON tests FOR SELECT
  TO authenticated USING (is_published);

GRANT SELECT ON test_questions TO authenticated;
DROP POLICY IF EXISTS "select_questions_of_published_tests" ON test_questions;
CREATE POLICY "select_questions_of_published_tests" ON test_questions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tests t WHERE t.id = test_questions.test_id AND t.is_published)
  );

GRANT SELECT ON study_materials TO authenticated;
DROP POLICY IF EXISTS "select_published_materials" ON study_materials;
CREATE POLICY "select_published_materials" ON study_materials FOR SELECT
  TO authenticated USING (is_published);

GRANT SELECT ON attempts TO authenticated;
DROP POLICY IF EXISTS "select_own_attempts" ON attempts;
CREATE POLICY "select_own_attempts" ON attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON attempt_answers TO authenticated;
DROP POLICY IF EXISTS "select_own_attempt_answers" ON attempt_answers;
CREATE POLICY "select_own_attempt_answers" ON attempt_answers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_answers.attempt_id AND a.user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(left(trim(NEW.raw_user_meta_data->>'full_name'), 60), ''), 'Student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, full_name)
SELECT u.id, COALESCE(NULLIF(left(trim(u.raw_user_meta_data->>'full_name'), 60), ''), 'Student')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
