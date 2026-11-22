export type Difficulty = 'easy' | 'medium' | 'hard';
export type TestKind = 'practice' | 'live';
export type MaterialCategory =
  | 'ncert_notes'
  | 'important_questions'
  | 'topper_notes'
  | 'chapter_mcqs'
  | 'revision_notes'
  | 'previous_year_questions'
  | 'sample_papers';
export type Medium = 'English' | 'Hindi';
export type LeaderboardPeriod = 'week' | 'month';

export interface SubjectRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface SubjectWithMeta extends SubjectRow {
  questions: { count: number }[];
  tests: { id: string; kind: TestKind }[];
}

export interface TestRow {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  kind: TestKind;
  duration_minutes: number;
  scheduled_at: string | null;
  test_questions: { count: number }[];
}

export interface TestDetail {
  id: string;
  title: string;
  description: string | null;
  kind: TestKind;
  duration_minutes: number;
  scheduled_at: string | null;
  subject: { name: string; slug: string } | null;
  test_questions: { count: number }[];
}

export interface QuestionRow {
  id: string;
  subject_id: string;
  chapter: string | null;
  question_text: string;
  options: string[];
  difficulty: Difficulty;
}

export interface TestQuestionRow {
  position: number;
  question: QuestionRow | null;
}

export interface ReviewItem {
  question_id: string;
  subject_id: string;
  selected_index: number | null;
  correct_index: number;
  is_correct: boolean | null;
  explanation: string | null;
}

export interface SubmitResult {
  attempt_id: string;
  score: number;
  max_score: number;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  review: ReviewItem[];
}

export interface AttemptRow {
  id: string;
  score: number;
  max_score: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  total_questions: number;
  completed_at: string;
  test: { title: string } | null;
}

export interface AttemptAnswerRow {
  question_id: string;
  subject_id: string;
  is_correct: boolean | null;
}

export interface StudyMaterialRow {
  id: string;
  title: string;
  description: string | null;
  category: MaterialCategory;
  class_level: number;
  medium: Medium;
  body: string | null;
  content_url: string | null;
}

export interface LeaderboardRow {
  place: number;
  user_id: string;
  full_name: string;
  points: number;
  tests_completed: number;
}

export interface PlatformStats {
  questions: number;
  tests: number;
  students: number;
  notes_total: number;
  notes_today: number;
}

export interface NoteRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}
