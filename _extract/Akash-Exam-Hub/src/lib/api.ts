import { supabase } from '@/lib/supabase';
import type {
  AttemptAnswerRow,
  AttemptRow,
  LeaderboardPeriod,
  LeaderboardRow,
  NoteRow,
  PlatformStats,
  StudyMaterialRow,
  SubjectWithMeta,
  SubmitResult,
  TestDetail,
  TestQuestionRow,
  TestRow,
} from '@/lib/types';

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

function unwrap<T>(result: QueryResult<T>): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data === null) {
    throw new Error('The server returned no data.');
  }
  return result.data;
}

export async function fetchSubjects(): Promise<SubjectWithMeta[]> {
  const result = await supabase
    .from('subjects')
    .select('id, slug, name, description, sort_order, questions(count), tests(id, kind)')
    .order('sort_order', { ascending: true });
  return unwrap(result as QueryResult<SubjectWithMeta[]>);
}

export async function fetchPublishedTests(): Promise<TestRow[]> {
  const result = await supabase
    .from('tests')
    .select('id, title, description, subject_id, kind, duration_minutes, scheduled_at, test_questions(count)')
    .eq('is_published', true)
    .order('scheduled_at', { ascending: true, nullsFirst: false });
  return unwrap(result as QueryResult<TestRow[]>);
}

export async function fetchTestDetail(testId: string): Promise<TestDetail | null> {
  const result = await supabase
    .from('tests')
    .select('id, title, description, kind, duration_minutes, scheduled_at, subject:subjects(name, slug), test_questions(count)')
    .eq('id', testId)
    .maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data as TestDetail | null;
}

export async function fetchTestQuestions(testId: string): Promise<TestQuestionRow[]> {
  const result = await supabase
    .from('test_questions')
    .select('position, question:questions(id, subject_id, chapter, question_text, options, difficulty)')
    .eq('test_id', testId)
    .order('position', { ascending: true });
  const rows = unwrap(result as QueryResult<TestQuestionRow[]>);
  return rows.filter((row) => row.question !== null);
}

export async function submitTestAttempt(
  testId: string,
  answers: { question_id: string; selected_index: number | null }[],
): Promise<SubmitResult> {
  const result = await supabase.rpc('submit_test_attempt', {
    p_test_id: testId,
    p_answers: answers,
  });
  return unwrap(result as QueryResult<SubmitResult>);
}

export async function fetchMyAttempts(): Promise<AttemptRow[]> {
  const result = await supabase
    .from('attempts')
    .select('id, score, max_score, correct_count, incorrect_count, unanswered_count, total_questions, completed_at, test:tests(title)')
    .order('completed_at', { ascending: true });
  return unwrap(result as QueryResult<AttemptRow[]>);
}

export async function fetchMyAttemptAnswers(): Promise<AttemptAnswerRow[]> {
  const result = await supabase
    .from('attempt_answers')
    .select('question_id, subject_id, is_correct, subject:subjects(name)');
  return unwrap(result as QueryResult<AttemptAnswerRow[]>);
}

export async function fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
  const result = await supabase.rpc('get_leaderboard', { p_period: period });
  return unwrap(result as QueryResult<LeaderboardRow[]>);
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const result = await supabase.rpc('platform_stats');
  return unwrap(result as QueryResult<PlatformStats>);
}

export async function fetchNotes(): Promise<NoteRow[]> {
  const result = await supabase
    .from('notes')
    .select('id, title, body, created_at, updated_at')
    .order('updated_at', { ascending: false });
  return unwrap(result as QueryResult<NoteRow[]>);
}

export async function createNote(title: string, body: string): Promise<NoteRow> {
  const result = await supabase
    .from('notes')
    .insert({ title, body })
    .select('id, title, body, created_at, updated_at')
    .single();
  return unwrap(result as QueryResult<NoteRow>);
}

export async function updateNote(id: string, title: string, body: string): Promise<NoteRow> {
  const result = await supabase
    .from('notes')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, title, body, created_at, updated_at')
    .single();
  return unwrap(result as QueryResult<NoteRow>);
}

export async function deleteNote(id: string): Promise<void> {
  const result = await supabase.from('notes').delete().eq('id', id);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function fetchStudyMaterials(): Promise<StudyMaterialRow[]> {
  const result = await supabase
    .from('study_materials')
    .select('id, title, description, category, class_level, medium, body, content_url')
    .order('class_level', { ascending: true })
    .order('title', { ascending: true });
  return unwrap(result as QueryResult<StudyMaterialRow[]>);
}
