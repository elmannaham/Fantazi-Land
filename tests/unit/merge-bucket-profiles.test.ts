import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/services/sync.service", () => ({ syncService: { getBucketProfiles: vi.fn() } }));

const { mergeBucketProfiles } = await import("@/lib/repositories/profiles.repository");
import type { ProfileWithStats } from "@/lib/types";

const profile = (name: string, folder: string) =>
  ({ id: folder.toLowerCase(), name, storage_folder_id: folder }) as unknown as ProfileWithStats;

describe("mergeBucketProfiles", () => {
  test("appends bucket-only profiles and skips folders already in the catalogue (case-insensitive)", async () => {
    const catalogue = [profile("Alisha", "Alisha")];
    const bucket = [profile("Alisha", "alisha"), profile("Marie-Claire Dupré", "Marie-Claire-Dupre")];

    const merged = await mergeBucketProfiles(catalogue, async () => bucket);

    expect(merged.map((p) => p.name)).toEqual(["Alisha", "Marie-Claire Dupré"]);
  });

  test("keeps the catalogue when the bucket cannot be read", async () => {
    const catalogue = [profile("Alisha", "Alisha")];

    const merged = await mergeBucketProfiles(catalogue, async () => {
      throw new Error("bucket down");
    });

    expect(merged).toEqual(catalogue);
  });
});
