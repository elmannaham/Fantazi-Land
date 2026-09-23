import { describe, expect, test } from "vitest";
import { accentFromPixels, DEFAULT_ACCENT, rgbToHsl } from "@/lib/color";

function pixels(...rgb: [number, number, number][]): Uint8ClampedArray {
  return new Uint8ClampedArray(rgb.flatMap(([r, g, b]) => [r, g, b, 255]));
}

describe("rgbToHsl", () => {
  test("converts pure red", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });

  test("returns zero saturation for greys", () => {
    expect(rgbToHsl(128, 128, 128).s).toBe(0);
  });
});

describe("accentFromPixels", () => {
  test("falls back to the default accent when the image is only greys", () => {
    const accent = accentFromPixels(pixels([20, 20, 20], [240, 240, 240], [128, 128, 128]));

    expect(accent).toEqual(DEFAULT_ACCENT);
  });

  test("picks the dominant saturated hue and ignores greys", () => {
    const accent = accentFromPixels(
      pixels([200, 40, 120], [210, 50, 130], [190, 30, 110], [30, 30, 30], [10, 120, 200])
    );

    // Pink/magenta family dominates
    expect(accent.h).toBeGreaterThanOrEqual(315);
    expect(accent.h).toBeLessThanOrEqual(335);
  });

  test("clamps saturation and lightness so the accent stays readable on dark backgrounds", () => {
    const accent = accentFromPixels(pixels([120, 10, 10], [110, 5, 5], [130, 15, 15]));

    expect(accent.s).toBeGreaterThanOrEqual(55);
    expect(accent.s).toBeLessThanOrEqual(85);
    expect(accent.l).toBeGreaterThanOrEqual(58);
    expect(accent.l).toBeLessThanOrEqual(70);
  });

  test("prefers an outfit or background hue over skin tones when both are present", () => {
    const skin = Array.from({ length: 10 }, (): [number, number, number] => [224, 172, 140]);
    const outfit = Array.from({ length: 4 }, (): [number, number, number] => [40, 90, 200]);

    const accent = accentFromPixels(pixels(...skin, ...outfit));

    expect(accent.h).toBeGreaterThanOrEqual(210);
    expect(accent.h).toBeLessThanOrEqual(230);
  });

  test("still uses a skin hue when it is the only colour", () => {
    const accent = accentFromPixels(pixels([224, 172, 140], [220, 165, 130]));

    expect(accent.h).toBeGreaterThanOrEqual(15);
    expect(accent.h).toBeLessThanOrEqual(30);
  });

  test("ignores transparent pixels", () => {
    const data = new Uint8ClampedArray([255, 0, 0, 0, 255, 0, 0, 0]);

    expect(accentFromPixels(data)).toEqual(DEFAULT_ACCENT);
  });
});
