"use client";

/** Longest side after resizing; large enough for the full-screen hero. */
export const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/** Target size for one resized image so avatar + 5 photos stay under Vercel's 4.5 MB body limit. */
export function scaledSize(width: number, height: number, max = MAX_IMAGE_DIMENSION): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/**
 * Resizes a photo in the browser and re-encodes it as JPEG.
 * Returns the original file when the browser cannot decode it or when the
 * result would not be smaller.
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = scaledSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    return file;
  }
}
