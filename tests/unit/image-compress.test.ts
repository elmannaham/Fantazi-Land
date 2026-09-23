import { describe, expect, test } from "vitest";
import { MAX_IMAGE_DIMENSION, scaledSize } from "@/lib/image-compress";

describe("scaledSize", () => {
  test("keeps images that already fit", () => {
    expect(scaledSize(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  test("scales the longest side down to the maximum and keeps the ratio", () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: MAX_IMAGE_DIMENSION, height: 1200 });
    expect(scaledSize(3000, 6000)).toEqual({ width: 800, height: MAX_IMAGE_DIMENSION });
  });
});
