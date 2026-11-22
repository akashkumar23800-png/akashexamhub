import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { ImageFilePicker } from '@/components/tools/ImageFilePicker';
import { ERROR_TEXT_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS } from '@/components/tools/toolStyles';
import { useImageSource } from '@/hooks/useImageSource';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import {
  IMAGE_FORMATS,
  canvasToBlob,
  downloadBlob,
  fileBaseName,
  formatFileSize,
  renderImage,
  type ImageFormatKey,
} from '@/lib/imageProcessing';

export function ImageConvertTool() {
  const { source, error, loading, loadFile } = useImageSource();
  const [format, setFormat] = useState<ImageFormatKey>('jpeg');
  const [result, setResult] = useState<Blob | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const resultUrl = useObjectUrl(result);

  const outputName = useMemo(
    () => (source ? `${fileBaseName(source.file.name)}-converted.${IMAGE_FORMATS[format].extension}` : ''),
    [source, format],
  );

  const handleFile = (file: File) => {
    setResult(null);
    setConvertError(null);
    loadFile(file);
  };

  const handleConvert = async () => {
    if (!source) return;
    setConverting(true);
    setConvertError(null);
    try {
      const canvas = renderImage(source.image, { rotation: 0, flipH: false, flipV: false }, {
        background: format === 'jpeg' ? '#ffffff' : undefined,
      });
      setResult(await canvasToBlob(canvas, IMAGE_FORMATS[format].mime, 0.92));
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'The file could not be converted.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageFilePicker fileName={source?.file.name ?? null} loading={loading} onSelect={handleFile} />
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}

      {source && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Convert to</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Output format">
              {(Object.keys(IMAGE_FORMATS) as ImageFormatKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={format === key}
                  onClick={() => {
                    setFormat(key);
                    setResult(null);
                  }}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                    format === key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {IMAGE_FORMATS[key].label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleConvert} disabled={converting} className={PRIMARY_BUTTON_CLASS}>
            {converting ? 'Converting...' : 'Convert image'}
          </button>
          {convertError && <p className={ERROR_TEXT_CLASS} role="alert">{convertError}</p>}

          {result && resultUrl && (
            <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Ready: {outputName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Original {formatFileSize(source.file.size)} to new {formatFileSize(result.size)}
                  </p>
                </div>
                <button type="button" onClick={() => downloadBlob(result, outputName)} className={SECONDARY_BUTTON_CLASS}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>
              </div>
              <img src={resultUrl} alt="Converted preview" className="mt-4 max-h-80 w-full rounded-xl object-contain" />
            </div>
          )}
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        Only images are supported. Documents such as Word files and PDFs cannot be converted here yet.
      </p>
    </div>
  );
}
