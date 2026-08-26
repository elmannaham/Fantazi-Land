import { describe, it, expect } from "vitest";
import { syncService } from "@/lib/services/sync.service";
import {
  createProfileSchema,
  csvProfileRowSchema,
} from "@/lib/schemas";

describe("SyncService & Schemas", () => {
  it("should encode and decode storage folder name accurately", () => {
    const mockProfile = {
      id: "test-uuid-123",
      name: "Marina Dupont",
      category: "Photographie" as const,
      bio: "Photographe portrait & mode",
      base_rate: 1500,
      currency: "EUR",
      instagram_url: "https://instagram.com/marinadupont",
      is_available: true,
    };

    const folderName = syncService.encodeFolderName(mockProfile as any);
    expect(folderName).toContain("Marina_Dupont");
    expect(folderName).toContain("Photographie");

    const decoded = syncService.decodeFolderName(folderName);
    expect(decoded.name).toBe("Marina Dupont");
    expect(decoded.category).toBe("Photographie");
    expect(decoded.metadata.bio).toBe("Photographe portrait & mode");
    expect(decoded.metadata.baseRate).toBe(1500);
    expect(decoded.metadata.currency).toBe("EUR");
    expect(decoded.metadata.instagram).toBe("https://instagram.com/marinadupont");
  });

  it("should validate valid profile schema", () => {
    const validData = {
      name: "Sophie Martin",
      category: "Vidéographie",
      baseRate: 2000,
      currency: "EUR",
      isPublic: true,
      isAvailable: true,
    };

    const parsed = createProfileSchema.parse(validData);
    expect(parsed.name).toBe("Sophie Martin");
    expect(parsed.category).toBe("Vidéographie");
  });

  it("should reject invalid category in profile schema", () => {
    const invalidData = {
      name: "Sophie Martin",
      category: "InvalidCategory",
      baseRate: 2000,
    };

    expect(() => createProfileSchema.parse(invalidData)).toThrow();
  });

  it("should validate and parse CSV row", () => {
    const csvRow = {
      name: "Claire Voyant",
      category: "Lifestyle",
      bio: "Créatrice lifestyle & voyage",
      baseRate: "1200",
      currency: "EUR",
      isAvailable: "true",
    };

    const parsed = csvProfileRowSchema.parse(csvRow);
    expect(parsed.name).toBe("Claire Voyant");
    expect(parsed.category).toBe("Lifestyle");
    expect(parsed.baseRate).toBe(1200);
    expect(parsed.isAvailable).toBe(true);
  });
});
