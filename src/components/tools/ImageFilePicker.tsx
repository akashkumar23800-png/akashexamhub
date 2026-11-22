import { ImagePlus } from 'lucide-react';
import { useId } from 'react';

export function ImageFilePicker({
  fileName,
  loading,
  onSelect,
}: {
  fileName: string | null;
  loading: boolean;
  onSelect: (file: File) => void;
}) {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-stone-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
        <ImagePlus className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold text-slate-900">
        {loading ? 'Opening image...' : fileName ? 'Choose a different image' : 'Choose an image'}
      </span>
      <span className="text-xs text-slate-500">
        {fileName ? `Selected: ${fileName}` : 'PNG, JPEG or WebP. Your file stays on your device.'}
      </span>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={loading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = '';
        }}
      />
    </label>
  );
}
