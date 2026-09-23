import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLoadableImages } from "@/lib/hooks/useLoadableImages";

class FakeImage {
  static broken = new Set<string>();
  static probed: string[] = [];
  onerror: (() => void) | null = null;
  set src(value: string) {
    FakeImage.probed.push(value);
    if (FakeImage.broken.has(value)) queueMicrotask(() => this.onerror?.());
  }
}

const identity = (url: string) => url;

beforeEach(() => {
  FakeImage.broken = new Set();
  FakeImage.probed = [];
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useLoadableImages", () => {
  test("keeps every image until one fails, then hides only the broken one", async () => {
    FakeImage.broken.add("https://cdn.test/missing.jpg");
    const urls = ["https://cdn.test/a.jpg", "https://cdn.test/missing.jpg", "https://cdn.test/b.jpg"];

    const { result } = renderHook(() => useLoadableImages(urls, identity));
    expect(result.current).toEqual(urls);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toEqual(["https://cdn.test/a.jpg", "https://cdn.test/b.jpg"]);
  });

  test("never probes or hides videos", async () => {
    const urls = ["https://cdn.test/clip.mp4", "https://cdn.test/a.jpg"];

    const { result } = renderHook(() => useLoadableImages(urls, identity));
    await act(async () => {
      await Promise.resolve();
    });

    expect(FakeImage.probed).toEqual(["https://cdn.test/a.jpg"]);
    expect(result.current).toEqual(urls);
  });
});
