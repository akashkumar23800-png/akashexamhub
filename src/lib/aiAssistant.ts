import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type AssistantMode = 'ask' | 'rewrite' | 'ai-detect' | 'doubt' | 'planner' | 'quiz' | 'notes' | 'performance' | 'english';
export type RewriteStyle = 'simple' | 'formal' | 'friendly' | 'exam-answer' | 'summary';

export interface AssistantHistoryItem {
  role: 'user' | 'model';
  text: string;
}
export interface AssistantRequest {
  mode: AssistantMode;
  input: string;
  style?: RewriteStyle;
  classLevel?: number;
  subject?: string;
  chapter?: string;
  language?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  availableMinutes?: number;
  topics?: string;
  history?: AssistantHistoryItem[];
  image?: { mimeType: string; data: string };
}
interface AssistantReply { text?: string; error?: string; model?: string; }

const FALLBACK_ERROR = 'The AI Study Assistant could not answer. Please try again.';

export async function askStudyAssistant(request: AssistantRequest): Promise<{ text: string; model?: string }> {
  if (!isSupabaseConfigured) {
    const endpoint = '/api/ai-assistant';
    const resolvedUrl =
      typeof window !== 'undefined' ? new URL(endpoint, window.location.origin).href : endpoint;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
    } catch (err) {
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(`[AI Assistant] Network request failed for ${resolvedUrl}:`, err);
      throw new Error(`Request failed for ${endpoint} (${resolvedUrl}) — ${detail}`);
    }
    const body = (await response.json().catch(() => null)) as AssistantReply | null;
    if (!response.ok) {
      throw new Error(body?.error || FALLBACK_ERROR);
    }
    if (!body || typeof body.text !== 'string' || !body.text.trim()) {
      throw new Error(body?.error || FALLBACK_ERROR);
    }
    return { text: body.text, model: body.model };
  }

  const { data, error } = await supabase.functions.invoke<AssistantReply>('ai-study-assistant', { body: request });
  if (error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      const body = (await context.json().catch(() => null)) as AssistantReply | null;
      if (body?.error) throw new Error(body.error);
    }
    throw new Error(FALLBACK_ERROR);
  }
  if (!data || typeof data.text !== 'string' || !data.text.trim()) {
    throw new Error(data?.error || FALLBACK_ERROR);
  }
  return { text: data.text, model: data.model };
}
