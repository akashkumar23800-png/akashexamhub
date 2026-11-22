import { useState, type FormEvent } from 'react';
import { ERROR_TEXT_CLASS, FIELD_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { createNote, updateNote } from '@/lib/api';
import type { NoteRow } from '@/lib/types';

const MAX_BODY_LENGTH = 50000;

export function NoteEditor({
  note,
  onSaved,
  onCancel,
}: {
  note?: NoteRow;
  onSaved: (note: NoteRow) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Give your note a title before saving.');
      return;
    }
    if (body.length > MAX_BODY_LENGTH) {
      setError(`Notes can be up to ${MAX_BODY_LENGTH.toLocaleString()} characters.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = note ? await updateNote(note.id, trimmedTitle, body) : await createNote(trimmedTitle, body);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The note could not be saved. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-900">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="For example, Photosynthesis key points"
          className={FIELD_CLASS}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-900">Note</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={12}
          placeholder="Write your note here..."
          className={`${FIELD_CLASS} resize-y leading-relaxed`}
        />
      </label>

      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={PRIMARY_BUTTON_CLASS}>
          {saving ? 'Saving...' : note ? 'Save changes' : 'Save note'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving} className={SECONDARY_BUTTON_CLASS}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
