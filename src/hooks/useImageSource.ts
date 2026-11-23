import { useCallback, useState } from 'react';
import { loadImage } from '@/lib/imageProcessing';

export interface LoadedImage {
  file: File;
  image: HTMLImageElement;
}

export function useImageSource() {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setSource(null);
      setError('Please choose an image file (PNG, JPEG or WebP).');
      return;
    }
    setLoading(true);
    try {
      const image = await loadImage(file);
      setSource({ file, image });
    } catch (err) {
      setSource(null);
      setError(err instanceof Error ? err.message : 'This image could not be opened.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { source, error, loading, loadFile };
}
