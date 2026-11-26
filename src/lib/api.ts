import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const resolvedUrl =
    typeof window !== 'undefined' ? new URL(path, window.location.origin).href : path;

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[API] Network request failed for ${resolvedUrl}:`, err);
    throw new Error(`Request failed for ${path} (${resolvedUrl}) — ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response from ${path} (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    const errMsg =
      parsed && typeof parsed === 'object' && 'error' in parsed && typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `Request to ${path} failed with status ${response.status}.`;
    throw new Error(errMsg);
  }

  return parsed as T;
}

export async function fetchSubjects(): Promise<SubjectWithMeta[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<SubjectWithMeta[]>('/api/subjects');
  }
  const result = await supabase
    .from('subjects')
    .select('id, slug, name, description, sort_order, questions(count), tests(id, kind)')
    .order('sort_order', { ascending: true });
  return unwrap(result as QueryResult<SubjectWithMeta[]>);
}

export async function fetchPublishedTests(): Promise<TestRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<TestRow[]>('/api/tests');
  }
  const result = await supabase
    .from('tests')
    .select('id, title, description, subject_id, kind, duration_minutes, scheduled_at, test_questions(count)')
    .eq('is_published', true)
    .order('scheduled_at', { ascending: true, nullsFirst: false });
  return unwrap(result as QueryResult<TestRow[]>);
}

export async function fetchTestDetail(testId: string): Promise<TestDetail | null> {
  if (!isSupabaseConfigured) {
    return apiRequest<TestDetail | null>(`/api/tests/${encodeURIComponent(testId)}`);
  }
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
  if (!isSupabaseConfigured) {
    return apiRequest<TestQuestionRow[]>(`/api/tests/${encodeURIComponent(testId)}/questions`);
  }
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
  if (!isSupabaseConfigured) {
    return apiRequest<SubmitResult>(`/api/tests/${encodeURIComponent(testId)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }
  const result = await supabase.rpc('submit_test_attempt', {
    p_test_id: testId,
    p_answers: answers,
  });
  return unwrap(result as QueryResult<SubmitResult>);
}

export async function fetchMyAttempts(): Promise<AttemptRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<AttemptRow[]>('/api/attempts');
  }
  const result = await supabase
    .from('attempts')
    .select('id, score, max_score, correct_count, incorrect_count, unanswered_count, total_questions, completed_at, test:tests(title)')
    .order('completed_at', { ascending: true });
  return unwrap(result as QueryResult<AttemptRow[]>);
}

export async function fetchMyAttemptAnswers(): Promise<AttemptAnswerRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<AttemptAnswerRow[]>('/api/attempt-answers');
  }
  const result = await supabase
    .from('attempt_answers')
    .select('question_id, subject_id, is_correct, subject:subjects(name)');
  return unwrap(result as QueryResult<AttemptAnswerRow[]>);
}

export async function fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<LeaderboardRow[]>(`/api/leaderboard?period=${encodeURIComponent(period)}`);
  }
  const result = await supabase.rpc('get_leaderboard', { p_period: period });
  return unwrap(result as QueryResult<LeaderboardRow[]>);
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  if (!isSupabaseConfigured) {
    return apiRequest<PlatformStats>('/api/stats');
  }
  const result = await supabase.rpc('platform_stats');
  return unwrap(result as QueryResult<PlatformStats>);
}

export async function fetchNotes(): Promise<NoteRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<NoteRow[]>('/api/notes');
  }
  const result = await supabase
    .from('notes')
    .select('id, title, body, created_at, updated_at')
    .order('updated_at', { ascending: false });
  return unwrap(result as QueryResult<NoteRow[]>);
}

export async function createNote(title: string, body: string): Promise<NoteRow> {
  if (!isSupabaseConfigured) {
    return apiRequest<NoteRow>('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
  }
  const result = await supabase
    .from('notes')
    .insert({ title, body })
    .select('id, title, body, created_at, updated_at')
    .single();
  return unwrap(result as QueryResult<NoteRow>);
}

export async function updateNote(id: string, title: string, body: string): Promise<NoteRow> {
  if (!isSupabaseConfigured) {
    return apiRequest<NoteRow>(`/api/notes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ title, body }),
    });
  }
  const result = await supabase
    .from('notes')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, title, body, created_at, updated_at')
    .single();
  return unwrap(result as QueryResult<NoteRow>);
}

export async function deleteNote(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    await apiRequest<void>(`/api/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return;
  }
  const result = await supabase.from('notes').delete().eq('id', id);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function fetchStudyMaterials(): Promise<StudyMaterialRow[]> {
  if (!isSupabaseConfigured) {
    return apiRequest<StudyMaterialRow[]>('/api/study-materials');
  }
  const result = await supabase
    .from('study_materials')
    .select('id, title, description, category, class_level, medium, body, content_url')
    .order('class_level', { ascending: true })
    .order('title', { ascending: true });
  return unwrap(result as QueryResult<StudyMaterialRow[]>);
}
