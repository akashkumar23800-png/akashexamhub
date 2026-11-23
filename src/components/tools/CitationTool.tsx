import { useState } from 'react';
import { CopyButton } from '@/components/tools/CopyButton';
import { ERROR_TEXT_CLASS, FIELD_CLASS, PRIMARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { buildCitation, type CitationFormat, type CitationInput, type CitationSourceType } from '@/lib/citation';

const EMPTY_FIELDS = { authors: '', title: '', year: '', publisher: '', url: '' };

const FORMATS: { value: CitationFormat; label: string }[] = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
];

const SOURCE_TYPES: { value: CitationSourceType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'website', label: 'Website' },
];

export function CitationTool() {
  const [format, setFormat] = useState<CitationFormat>('apa');
  const [sourceType, setSourceType] = useState<CitationSourceType>('book');
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [citation, setCitation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof EMPTY_FIELDS, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setCitation(null);
  };

  const handleGenerate = () => {
    if (!fields.authors.trim() || !fields.title.trim()) {
      setError('Please enter the author and the title.');
      setCitation(null);
      return;
    }
    if (!/^\d{4}$/.test(fields.year.trim())) {
      setError('Please enter the publication year as four digits, for example 2024.');
      setCitation(null);
      return;
    }
    const input: CitationInput = { format, sourceType, ...fields };
    setError(null);
    setCitation(buildCitation(input));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-bold text-slate-900">Citation style</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Citation style">
            {FORMATS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={format === option.value}
                onClick={() => {
                  setFormat(option.value);
                  setCitation(null);
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  format === option.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Source type</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Source type">
            {SOURCE_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={sourceType === option.value}
                onClick={() => {
                  setSourceType(option.value);
                  setCitation(null);
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  sourceType === option.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-bold text-slate-900">Author(s)</span>
          <input
            value={fields.authors}
            onChange={(event) => updateField('authors', event.target.value)}
            placeholder="Sharma, R. K."
            className={FIELD_CLASS}
          />
          <span className="block text-xs text-slate-500">Use Last name, initials. Separate several authors with a semicolon.</span>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-bold text-slate-900">Title</span>
          <input value={fields.title} onChange={(event) => updateField('title', event.target.value)} className={FIELD_CLASS} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-900">Year</span>
          <input
            value={fields.year}
            onChange={(event) => updateField('year', event.target.value)}
            inputMode="numeric"
            placeholder="2024"
            maxLength={4}
            className={FIELD_CLASS}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-900">{sourceType === 'book' ? 'Publisher (optional)' : 'Website name (optional)'}</span>
          <input value={fields.publisher} onChange={(event) => updateField('publisher', event.target.value)} className={FIELD_CLASS} />
        </label>
        {sourceType === 'website' && (
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-bold text-slate-900">Web address (optional)</span>
            <input
              value={fields.url}
              onChange={(event) => updateField('url', event.target.value)}
              placeholder="https://example.com/article"
              className={FIELD_CLASS}
            />
          </label>
        )}
      </div>

      <button type="button" onClick={handleGenerate} className={PRIMARY_BUTTON_CLASS}>
        Generate citation
      </button>
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {citation && (
        <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {format === 'apa' ? 'APA 7' : 'MLA 9'} citation
          </p>
          <p className="mt-3 break-words text-sm leading-relaxed text-slate-900">{citation}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Titles are plain text. Add italics in your document if your teacher asks for them.</p>
            <CopyButton text={citation} />
          </div>
        </div>
      )}
    </div>
  );
}
