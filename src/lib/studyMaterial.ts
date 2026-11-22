import type { MaterialCategory } from '@/lib/types';

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'ncert_notes', label: 'NCERT Notes' },
  { value: 'important_questions', label: 'Important Questions' },
  { value: 'topper_notes', label: 'Topper Notes' },
  { value: 'chapter_mcqs', label: 'Chapter-wise MCQs' },
  { value: 'revision_notes', label: 'Revision Notes' },
  { value: 'previous_year_questions', label: 'Previous Year Questions' },
  { value: 'sample_papers', label: 'Sample Papers' },
];

export function materialCategoryLabel(category: MaterialCategory): string {
  return MATERIAL_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
