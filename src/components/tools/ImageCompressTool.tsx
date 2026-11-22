import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { ImageFilePicker } from '@/components/tools/ImageFilePicker';
import { ERROR_TEXT_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { useImageSource } from '@/hooks/useImageSource';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import {
  IDENTITY_TRANSFORM,
  canvasToBlob,
  downloadBlob,
  fileBaseName,
  formatFileSize,
  renderImage,
} from '@/lib/imageProcessing';

const MAX_SIDE_PX = 2000;

export function ImageCompressTool() {
  const { source, error, loading, loadFile } = useImageSource();
  const [quality, setQuality] = useState(75);
  const [result, setResult] = useState<Blob | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressError, setCompressError] = useState<string | null>(null);
  const resultUrl = useObjectUrl(result);

  useEffect(() => {
    setResult(null);
  }, [source, quality]);

  const handleFile = (file: File) => {
    setCompressError(null);
    loadFile(file);
  };

  const handleCompress = async () => {
    if (!source) return;
    setCompressing(true);
    setCompressError(null);
    try {
      const canvas = renderImage(source.image, IDENTITY_TRANSFORM, {
        maxSide: MAX_SIDE_PX,
        background: '#ffffff',
      });
      setResult(await canvasToBlob(canvas, 'image/webp', quality / 100));
    } catch (err) {
      setCompressError(err instanceof Error ? err.message : 'The image could not be compressed.');
    } finally {
      setCompressing(false);
    }
  };

  const savedBytes = source && result ? source.file.size - result.size : 0;
  const outputName = source ? `${fileBaseName(source.file.name)}-compressed.webp` : '';

  return (
    <div className="space-y-6">
      <ImageFilePicker fileName={source?.file.name ?? null} loading={loading} onSelect={handleFile} />
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {source && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="compress-quality" className="text-sm font-bold text-slate-900">
                Quality
              </label>
              <span className="text-sm font-bold tabular-nums text-slate-600">{quality}%</span>
            </div>
            <input
              id="compress-quality"
              type="range"
              min={40}
              max={95}
              step={5}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="mt-3 w-full accent-slate-900"
            />
            <p className="mt-2 text-xs text-slate-500">Lower quality makes a smaller file. Images larger than 2000 pixels are resized.</p>
          </div>

          <button type="button" onClick={handleCompress} disabled={compressing} className={PRIMARY_BUTTON_CLASS}>
            {compressing ? 'Compressing...' : 'Compress image'}
          </button>
          {compressError && <p className={ERROR_TEXT_CLASS} role="alert">{compressError}</p>}

          {result && resultUrl && (
            <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {formatFileSize(source.file.size)} to {formatFileSize(result.size)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {savedBytes > 0
                      ? `You save ${formatFileSize(savedBytes)} (${Math.round((savedBytes / source.file.size) * 100)}% smaller).`
                      : 'This image was already small, so the compressed file is not smaller. Keep your original file.'}
                  </p>
                </div>
                {savedBytes > 0 && (
                  <button type="button" onClick={() => downloadBlob(result, outputName)} className={SECONDARY_BUTTON_CLASS}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download
                  </button>
                )}
              </div>
              <img src={resultUrl} alt="Compressed preview" className="mt-4 max-h-80 w-full rounded-xl object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
