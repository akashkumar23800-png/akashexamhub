import { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, FileText, X } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { useAsync } from '@/hooks/useAsync';
import { fetchStudyMaterials } from '@/lib/api';
import { MATERIAL_CATEGORIES, materialCategoryLabel } from '@/lib/studyMaterial';
import type { MaterialCategory, Medium, StudyMaterialRow } from '@/lib/types';

const CLASS_LEVELS = [6, 7, 8, 9, 10, 11, 12];
const MEDIUMS: Medium[] = ['English', 'Hindi'];

export function StudyMaterialPage() {
  const { data, error, loading, reload } = useAsync(fetchStudyMaterials, []);
  const [category, setCategory] = useState<MaterialCategory | 'all'>('all');
  const [classLevel, setClassLevel] = useState<number>(10);
  const [medium, setMedium] = useState<Medium>('English');
  const [openItem, setOpenItem] = useState<StudyMaterialRow | null>(null);

  const visible = useMemo(
    () =>
      (data ?? []).filter(
        (item) =>
          item.class_level === classLevel &&
          item.medium === medium &&
          (category === 'all' || item.category === category),
      ),
    [data, classLevel, medium, category],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow="Learn"
        title="Study Material"
        description="CBSE notes, important questions and previous year papers for Classes 6 to 12, in English or Hindi medium."
      />

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Class</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Class">
            {CLASS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={classLevel === level}
                onClick={() => setClassLevel(level)}
                className={`h-9 min-w-[2.25rem] rounded-full px-3 text-sm font-bold transition ${
                  classLevel === level ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-500">Medium</span>
          <div className="flex gap-1.5" role="group" aria-label="Medium">
            {MEDIUMS.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={medium === item}
                onClick={() => setMedium(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
                  medium === item ? 'bg-gradient-to-r from-violet-600 to-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end" role="group" aria-label="Material type">
          {[{ value: 'all' as const, label: 'All types' }, ...MATERIAL_CATEGORIES].map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                category === item.value
                  ? 'border-violet-600 bg-violet-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading && !data && <LoadingState label="Loading study material..." />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {data && visible.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No material here yet"
            description={`We have no ${category === 'all' ? 'material' : materialCategoryLabel(category).toLowerCase()} for Class ${classLevel} in ${medium} yet. Try another class or medium.`}
          />
        )}
        {data && visible.length > 0 && (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenItem(item)}
                  className="group flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                >
                  <span className="inline-flex w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                    {materialCategoryLabel(item.category)}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900 group-hover:text-violet-700">{item.title}</h3>
                  {item.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.description}</p>}
                  <span className="mt-auto pt-5 text-sm font-bold text-violet-700">Open material</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openItem && (
        <Modal title={openItem.title} onClose={() => setOpenItem(null)}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-500">
              {materialCategoryLabel(openItem.category)} - Class {openItem.class_level} - {openItem.medium} medium
            </p>
            {openItem.description && <p className="text-sm leading-relaxed text-slate-700">{openItem.description}</p>}
            {openItem.body && (
              <div className="flex gap-3 rounded-2xl bg-slate-50 p-5">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{openItem.body}</p>
              </div>
            )}
            {openItem.content_url && (
              <a
                href={openItem.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
              >
                Open PDF
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {!openItem.body && !openItem.content_url && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <X className="h-4 w-4" aria-hidden="true" />
                This material has no content attached yet.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
