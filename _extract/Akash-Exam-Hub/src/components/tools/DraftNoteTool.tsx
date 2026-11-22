import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { NoteEditor } from '@/components/tools/NoteEditor';
import { SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import type { NoteRow } from '@/lib/types';

export function DraftNoteTool() {
  const [savedNote, setSavedNote] = useState<NoteRow | null>(null);
  const [draftKey, setDraftKey] = useState(0);

  return (
    <div className="space-y-6">
      {savedNote && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Saved &ldquo;{savedNote.title}&rdquo;. The page is clear for your next note.
          </p>
          <a href="#/tools/note-taking" className={SECONDARY_BUTTON_CLASS}>
            Open my notes
          </a>
        </div>
      )}
      <NoteEditor
        key={draftKey}
        onSaved={(note) => {
          setSavedNote(note);
          setDraftKey((value) => value + 1);
        }}
      />
    </div>
  );
}
