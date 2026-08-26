import { describe, it, expect } from "vitest";
import { createProfileSchema, createBookingSchema, createReviewSchema } from "@/lib/schemas";
import { syncService } from "@/lib/services/sync.service";

describe("Backend Integration & Schemas", () => {
  it("should validate a full booking flow payload", () => {
    const bookingPayload = {
      profileId: "550e8400-e29b-41d4-a716-446655440000",
      projectTitle: "Shooting Campagne Automne 2026",
      projectDescription: "Shooting extérieur à Paris 3 looks",
      startDate: "2026-09-15",
      endDate: "2026-09-16",
      budget: 2500,
      currency: "EUR",
      clientName: "Maison Haute Couture",
      clientEmail: "contact@hautecouture.fr",
    };

    const parsed = createBookingSchema.parse(bookingPayload);
    expect(parsed.projectTitle).toBe("Shooting Campagne Automne 2026");
    expect(parsed.budget).toBe(2500);
    expect(parsed.clientEmail).toBe("contact@hautecouture.fr");
  });

  it("should validate reviews payload and rating bounds", () => {
    const validReview = {
      profileId: "550e8400-e29b-41d4-a716-446655440000",
      rating: 5,
      comment: "Prestation exceptionnelle, très professionnelle !",
      clientName: "Agence Digitale",
    };

    const parsed = createReviewSchema.parse(validReview);
    expect(parsed.rating).toBe(5);

    const invalidReview = {
      profileId: "550e8400-e29b-41d4-a716-446655440000",
      rating: 6, // Hors limites (1-5)
    };

    expect(() => createReviewSchema.parse(invalidReview)).toThrow();
  });

  it("should handle profile encoding and decoded metadata structure", () => {
    const testProfile = {
      name: "Julie Bertin",
      category: "Contenu Mode" as const,
      bio: "Créatrice de contenu mode et tendances",
      base_rate: 1800,
      currency: "EUR",
      instagram_url: "https://instagram.com/juliebertin",
      tiktok_url: "https://tiktok.com/@juliebertin",
      is_available: true,
    };

    const encoded = syncService.encodeFolderName(testProfile as any);
    expect(encoded).toContain("Julie_Bertin");
    expect(encoded).toContain("Contenu_Mode");

    const decoded = syncService.decodeFolderName(encoded);
    expect(decoded.name).toBe("Julie Bertin");
    expect(decoded.category).toBe("Contenu Mode");
    expect(decoded.metadata.baseRate).toBe(1800);
  });
});
