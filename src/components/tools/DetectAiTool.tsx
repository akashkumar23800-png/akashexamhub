import { useState, type FormEvent } from 'react';
import { ERROR_TEXT_CLASS, FIELD_CLASS, PRIMARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { askStudyAssistant } from '@/lib/aiAssistant';

const MIN_CHARACTERS = 50;

interface Verdict {
  score: number;
  reasoning: string;
}

const PARSE_ERROR = 'The AI Study Assistant returned an unexpected result. Please try again.';

function parseVerdict(raw: string): Verdict {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(PARSE_ERROR);
  }
  if (!parsed || typeof parsed !== 'object') throw new Error(PARSE_ERROR);
  const { score, reasoning } = parsed as { score?: unknown; reasoning?: unknown };
  if (typeof score !== 'number' || score < 0 || score > 100 || typeof reasoning !== 'string') {
    throw new Error(PARSE_ERROR);
  }
  return { score: Math.round(score), reasoning };
}

function describeScore(score: number): { label: string; bar: string } {
  if (score < 35) return { label: 'Likely human-written', bar: 'bg-emerald-500' };
  if (score <= 65) return { label: 'Mixed or unclear', bar: 'bg-amber-500' };
  return { label: 'Likely AI-generated', bar: 'bg-rose-500' };
}

export function DetectAiTool() {
  const [text, setText] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (loading) return;
    if (trimmed.length < MIN_CHARACTERS) {
      setError(`Please paste at least ${MIN_CHARACTERS} characters so the estimate is meaningful.`);
      setVerdict(null);
      return;
    }

    setLoading(true);
    setError(null);
    setVerdict(null);
    try {
      const { text: raw } = await askStudyAssistant({ mode: 'ai-detect', input: trimmed });
      setVerdict(parseVerdict(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The text could not be analysed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const status = verdict ? describeScore(verdict.score) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={4000}
        rows={7}
        placeholder="Paste the text you want to check..."
        aria-label="Text to check"
        className={`${FIELD_CLASS} resize-y leading-relaxed`}
      />
      <button type="submit" disabled={!text.trim() || loading} className={PRIMARY_BUTTON_CLASS}>
        {loading ? 'Analysing...' : 'Estimate AI likelihood'}
      </button>

      {loading && (
        <p className="text-sm text-slate-600" role="status">
          Analysing your text...
        </p>
      )}
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {verdict && status && (
        <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated AI likelihood</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">{verdict.score}%</p>
            </div>
            <p className="text-right text-sm font-bold text-slate-900">{status.label}</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200" role="meter" aria-valuenow={verdict.score} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full transition-all duration-700 ${status.bar}`} style={{ width: `${verdict.score}%` }} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">{verdict.reasoning}</p>
          <p className="mt-4 text-xs text-slate-500">
            This is an estimate, not a guaranteed result. Do not use it as proof on its own.
          </p>
        </div>
      )}
    </form>
  );
}
