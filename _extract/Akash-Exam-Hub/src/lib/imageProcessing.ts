export interface ImageTransform {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

export const IDENTITY_TRANSFORM: ImageTransform = { rotation: 0, flipH: false, flipV: false };

export const IMAGE_FORMATS = {
  png: { label: 'PNG', mime: 'image/png', extension: 'png' },
  jpeg: { label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp' },
} as const;

export type ImageFormatKey = keyof typeof IMAGE_FORMATS;

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be opened as an image. Try a PNG, JPEG or WebP file.'));
    };
    image.src = url;
  });
}

export function renderImage(
  image: HTMLImageElement,
  transform: ImageTransform,
  options: { maxSide?: number; background?: string } = {},
): HTMLCanvasElement {
  const swapped = transform.rotation === 90 || transform.rotation === 270;
  const naturalW = swapped ? image.naturalHeight : image.naturalWidth;
  const naturalH = swapped ? image.naturalWidth : image.naturalHeight;
  const scale = options.maxSide ? Math.min(1, options.maxSide / Math.max(naturalW, naturalH)) : 1;
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Your browser could not prepare this image.');
  }

  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }

  context.translate(width / 2, height / 2);
  context.rotate((transform.rotation * Math.PI) / 180);
  context.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  const drawWidth = swapped ? height : width;
  const drawHeight = swapped ? width : height;
  context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be created. Please try again.'))),
      mime,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileBaseName(name: string): string {
  return name.replace(/\.[^.]+$/, '') || 'image';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
