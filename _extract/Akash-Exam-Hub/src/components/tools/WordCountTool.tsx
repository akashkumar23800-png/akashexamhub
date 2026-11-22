import { useMemo, useState } from 'react';
import { FIELD_CLASS } from '@/components/tools/toolStyles';
import { formatCount } from '@/lib/format';

function computeTextStats(text: string) {
  const trimmed = text.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    characters: [...text].length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences: trimmed ? trimmed.split(/[.!?।]+/).filter((part) => part.trim() !== '').length : 0,
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((part) => part.trim() !== '').length : 0,
    readingMinutes: trimmed ? Math.max(1, Math.ceil(trimmed.split(/\s+/).length / 200)) : 0,
  };
}

export function WordCountTool() {
  const [text, setText] = useState('');
  const stats = useMemo(() => computeTextStats(text), [text]);

  const tiles = [
    { label: 'Words', value: formatCount(stats.words) },
    { label: 'Characters', value: formatCount(stats.characters) },
    { label: 'Characters (no spaces)', value: formatCount(stats.charactersNoSpaces) },
    { label: 'Sentences', value: formatCount(stats.sentences) },
    { label: 'Paragraphs', value: formatCount(stats.paragraphs) },
    { label: 'Reading time', value: stats.readingMinutes === 0 ? '0 min' : `${stats.readingMinutes} min` },
  ];

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={9}
        placeholder="Paste or type your text here..."
        aria-label="Text to count"
        className={`${FIELD_CLASS} resize-y leading-relaxed`}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-slate-100">
            <p className="text-2xl font-extrabold tabular-nums text-slate-900">{tile.value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{tile.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">Reading time is based on 200 words per minute.</p>
    </div>
  );
}
