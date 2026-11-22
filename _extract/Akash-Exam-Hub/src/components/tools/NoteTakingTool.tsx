import { useMemo, useState } from 'react';
import { ArrowLeft, NotebookText, Plus, Search, Trash2 } from 'lucide-react';
import { NoteEditor } from '@/components/tools/NoteEditor';
import { ERROR_TEXT_CLASS, FIELD_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { useAsync } from '@/hooks/useAsync';
import { deleteNote, fetchNotes } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { NoteRow } from '@/lib/types';

type NoteView = { mode: 'list' } | { mode: 'edit'; note?: NoteRow };

export function NoteTakingTool() {
  const { data, error, loading, reload } = useAsync(fetchNotes, []);
  const [view, setView] = useState<NoteView>({ mode: 'list' });
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<NoteRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const visibleNotes = useMemo(() => {
    if (!data) return [];
    const search = query.trim().toLowerCase();
    if (!search) return data;
    return data.filter((note) => note.title.toLowerCase().includes(search) || note.body.toLowerCase().includes(search));
  }, [data, query]);

  if (view.mode === 'edit') {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => setView({ mode: 'list' })} className={SECONDARY_BUTTON_CLASS}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All notes
        </button>
        <NoteEditor
          note={view.note}
          onSaved={() => {
            setView({ mode: 'list' });
            reload();
          }}
          onCancel={() => setView({ mode: 'list' })}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteNote(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'The note could not be deleted. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const newNoteButton = (
    <button type="button" onClick={() => setView({ mode: 'edit' })} className={PRIMARY_BUTTON_CLASS}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      New note
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your notes"
            aria-label="Search notes"
            className={`${FIELD_CLASS} pl-11`}
          />
        </div>
        {newNoteButton}
      </div>

      {loading && !data && <LoadingState label="Loading your notes..." />}
      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={NotebookText}
          title="No notes yet"
          description="Write your first note and it will be saved to your account."
          action={newNoteButton}
        />
      )}
      {data && data.length > 0 && visibleNotes.length === 0 && (
        <p className="text-sm text-slate-500">No notes match &ldquo;{query}&rdquo;.</p>
      )}

      {visibleNotes.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visibleNotes.map((note) => (
            <li
              key={note.id}
              className="relative rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <button type="button" onClick={() => setView({ mode: 'edit', note })} className="block w-full p-4 pr-12 text-left">
                <p className="line-clamp-1 font-bold text-slate-900">{note.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{note.body || 'No content yet'}</p>
                <p className="mt-3 text-xs text-slate-500">Updated {formatDateTime(note.updated_at)}</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setPendingDelete(note);
                }}
                aria-label={`Delete ${note.title}`}
                className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <Modal title="Delete this note?" onClose={() => !deleting && setPendingDelete(null)}>
          <p className="text-sm leading-relaxed text-slate-600">
            &ldquo;{pendingDelete.title}&rdquo; will be deleted permanently.
          </p>
          {deleteError && <p className={`mt-4 ${ERROR_TEXT_CLASS}`} role="alert">{deleteError}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => setPendingDelete(null)} disabled={deleting} className={SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete note'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
