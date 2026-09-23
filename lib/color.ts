export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** Brand pink (#e65c9f) used when an image has no usable colour. */
export const DEFAULT_ACCENT: Hsl = { h: 331, s: 73, l: 63 };

const HUE_BUCKETS = 24;
const MIN_SATURATION = 25;
const MIN_LIGHTNESS = 15;
const MAX_LIGHTNESS = 85;
/** Skin tones (warm oranges) would win on most portraits; they only count at this weight. */
const SKIN_HUE_MAX = 45;
const SKIN_WEIGHT = 0.2;
/** Fixed lightness keeps every generated accent readable on the dark hero. */
const ACCENT_LIGHTNESS = 62;

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;

  return {
    h: Math.round((h * 60 + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Derives one accent colour from RGBA pixel data: the most common saturated hue
 * (weighted by saturation), clamped so it stays legible on a dark background.
 */
export function accentFromPixels(data: Uint8ClampedArray): Hsl {
  const weights = new Array<number>(HUE_BUCKETS).fill(0);
  const hueSums = new Array<number>(HUE_BUCKETS).fill(0);
  const satSums = new Array<number>(HUE_BUCKETS).fill(0);

  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < MIN_SATURATION || l < MIN_LIGHTNESS || l > MAX_LIGHTNESS) continue;

    const bucket = Math.floor((h / 360) * HUE_BUCKETS) % HUE_BUCKETS;
    const weight = h <= SKIN_HUE_MAX ? s * SKIN_WEIGHT : s;
    weights[bucket] += weight;
    hueSums[bucket] += h * weight;
    satSums[bucket] += s * weight;
  }

  const best = weights.reduce((top, w, i) => (w > weights[top] ? i : top), 0);
  if (weights[best] === 0) return DEFAULT_ACCENT;

  return {
    h: Math.round(hueSums[best] / weights[best]),
    s: clamp(Math.round(satSums[best] / weights[best]), 55, 85),
    l: ACCENT_LIGHTNESS,
  };
}

export function hslToCss({ h, s, l }: Hsl, alpha = 1): string {
  return alpha === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${alpha})`;
}
