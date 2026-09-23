"use client";

import { useEffect, useMemo, useState } from "react";

// Videos cannot be probed with an Image element; they are always kept
const VIDEO_URL = /\.(mp4|mov|webm|m4v)(\?|$)/i;

/**
 * Keeps every URL but drops, at display time, the images that fail to load
 * (e.g. a file removed from the storage bucket), so one missing photo never
 * breaks a gallery or slideshow. URLs are shown optimistically until they fail.
 */
export function useLoadableImages<T>(items: readonly T[], getUrl: (item: T) => string): T[] {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const urls = useMemo(() => items.map(getUrl), [items, getUrl]);
  const urlKey = urls.join("|");

  useEffect(() => {
    let isCancelled = false;
    urls.forEach((src) => {
      if (VIDEO_URL.test(src)) return;
      const probe = new Image();
      probe.onerror = () => {
        if (!isCancelled) setFailed((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
      };
      probe.src = src;
    });
    return () => {
      isCancelled = true;
    };
    // urlKey captures the list content; urls identity changes on every items change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  return useMemo(() => items.filter((item) => !failed.has(getUrl(item))), [items, failed, getUrl]);
}
