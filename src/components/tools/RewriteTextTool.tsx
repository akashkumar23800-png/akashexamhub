import { useState, type FormEvent } from 'react';
import { CopyButton } from '@/components/tools/CopyButton';
import { ERROR_TEXT_CLASS, FIELD_CLASS, PRIMARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { askStudyAssistant, type RewriteStyle } from '@/lib/aiAssistant';

const STYLES: { value: RewriteStyle; label: string }[] = [
  { value: 'simple', label: 'Simple' },
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'exam-answer', label: 'Exam answer' },
  { value: 'summary', label: 'Short summary' },
];

export function RewriteTextTool() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<RewriteStyle>('simple');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await askStudyAssistant({ mode: 'rewrite', input: trimmed, style }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The text could not be rewritten. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={4000}
        rows={7}
        placeholder="Paste the text you want to rewrite..."
        aria-label="Text to rewrite"
        className={`${FIELD_CLASS} resize-y leading-relaxed`}
      />

      <div>
        <p className="text-sm font-bold text-slate-900">Rewrite style</p>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Rewrite style">
          {STYLES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={style === option.value}
              onClick={() => setStyle(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                style === option.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={!text.trim() || loading} className={PRIMARY_BUTTON_CLASS}>
        {loading ? 'Rewriting...' : 'Rewrite text'}
      </button>

      {loading && (
        <p className="text-sm text-slate-600" role="status">
          The AI Study Assistant is rewriting your text...
        </p>
      )}
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {result && (
        <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{result}</p>
          <div className="mt-4 flex justify-end">
            <CopyButton text={result} />
          </div>
        </div>
      )}
    </form>
  );
}
