import { useMemo, useState } from 'react';
import { Download, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-react';
import { ImageFilePicker } from '@/components/tools/ImageFilePicker';
import { ERROR_TEXT_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { useImageSource } from '@/hooks/useImageSource';
import {
  IDENTITY_TRANSFORM,
  canvasToBlob,
  downloadBlob,
  fileBaseName,
  renderImage,
  type ImageTransform,
} from '@/lib/imageProcessing';

const PREVIEW_MAX_SIDE_PX = 1000;

export function ImageEditTool() {
  const { source, error, loading, loadFile } = useImageSource();
  const [transform, setTransform] = useState<ImageTransform>(IDENTITY_TRANSFORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const previewCanvas = useMemo(
    () => (source ? renderImage(source.image, transform, { maxSide: PREVIEW_MAX_SIDE_PX }) : null),
    [source, transform],
  );
  const previewDataUrl = useMemo(() => previewCanvas?.toDataURL('image/png') ?? null, [previewCanvas]);

  const rotate = (direction: 1 | -1) => {
    setTransform((current) => {
      const steps = ((current.rotation / 90 + direction) % 4 + 4) % 4;
      return { ...current, rotation: (steps * 90) as ImageTransform['rotation'] };
    });
  };

  const handleFile = (file: File) => {
    setSaveError(null);
    setTransform(IDENTITY_TRANSFORM);
    loadFile(file);
  };

  const handleDownload = async () => {
    if (!source) return;
    setSaving(true);
    setSaveError(null);
    try {
      const canvas = renderImage(source.image, transform);
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, `${fileBaseName(source.file.name)}-edited.png`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'The edited image could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageFilePicker fileName={source?.file.name ?? null} loading={loading} onSelect={handleFile} />
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {source && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => rotate(-1)} className={SECONDARY_BUTTON_CLASS}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Rotate left
            </button>
            <button type="button" onClick={() => rotate(1)} className={SECONDARY_BUTTON_CLASS}>
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Rotate right
            </button>
            <button
              type="button"
              onClick={() => setTransform((current) => ({ ...current, flipH: !current.flipH }))}
              className={SECONDARY_BUTTON_CLASS}
            >
              <FlipHorizontal className="h-4 w-4" aria-hidden="true" />
              Flip horizontal
            </button>
            <button
              type="button"
              onClick={() => setTransform((current) => ({ ...current, flipV: !current.flipV }))}
              className={SECONDARY_BUTTON_CLASS}
            >
              <FlipVertical className="h-4 w-4" aria-hidden="true" />
              Flip vertical
            </button>
            <button type="button" onClick={() => setTransform(IDENTITY_TRANSFORM)} className={SECONDARY_BUTTON_CLASS}>
              Reset
            </button>
          </div>

          {previewDataUrl && (
            <img src={previewDataUrl} alt="Edited image preview" className="max-h-96 w-full rounded-2xl bg-stone-100 object-contain p-2" />
          )}

          <button type="button" onClick={handleDownload} disabled={saving} className={PRIMARY_BUTTON_CLASS}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Preparing...' : 'Download as PNG'}
          </button>
          {saveError && <p className={ERROR_TEXT_CLASS} role="alert">{saveError}</p>}
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        Rotate and flip work on images. Editing PDF files is not available yet.
      </p>
    </div>
  );
}
