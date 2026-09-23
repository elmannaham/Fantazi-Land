"use client";

import { useEffect, useState } from "react";
import { accentFromPixels, DEFAULT_ACCENT, type Hsl } from "@/lib/color";

const SAMPLE_SIZE = 32;

/**
 * Samples an image and returns its dominant accent colour.
 * The image goes through the Next.js optimizer so it is same-origin and the
 * canvas is not tainted by the Supabase Storage host.
 */
export function useImageAccent(src: string | null | undefined): Hsl {
  const [accent, setAccent] = useState<Hsl>(DEFAULT_ACCENT);

  useEffect(() => {
    if (!src) {
      setAccent(DEFAULT_ACCENT);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=64&q=75`;

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        setAccent(accentFromPixels(ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data));
      } catch {
        // Canvas unavailable or tainted: keep the brand accent
        setAccent(DEFAULT_ACCENT);
      }
    };
    img.onerror = () => {
      if (!isCancelled) setAccent(DEFAULT_ACCENT);
    };

    return () => {
      isCancelled = true;
    };
  }, [src]);

  return accent;
}
