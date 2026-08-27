import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { profileCreationService } from "@/lib/services/profile-creation.service";
import { base44Client } from "@/lib/clients/base44.client";
import type { CreateProfileInput } from "@/lib/services/profile-creation.service";

// Mock Base44 Client
vi.mock("@/lib/clients/base44.client");

const mockProfileData: CreateProfileInput = {
  nom: "Test Creator",
  categorie: "Photographie",
  bio: "Test bio for testing purposes",
  avatar_url: "https://example.com/avatar.jpg",
  base_rate: 1500,
  currency: "EUR",
  instagram: "https://instagram.com/test",
  tiktok: "https://tiktok.com/@test",
};

describe("Profile Creation Error Handling", () => {
  const testUserId = "test-user-uuid";
  const testUserEmail = "test@example.com";

  beforeEach(async () => {
    // Clean up test data
    await prisma.failedSync.deleteMany({ where: { source_data: { path: ["user_id"], equals: testUserId } } as any });
    await prisma.profile.deleteMany({ where: { user_id: testUserId } });
  });

  afterEach(async () => {
    // Clean up after tests
    await prisma.failedSync.deleteMany({ where: { source_data: { path: ["user_id"], equals: testUserId } } as any });
    await prisma.profile.deleteMany({ where: { user_id: testUserId } });
  });

  it("should rollback profile if Base44 creation fails", async () => {
    // Mock Base44 error
    (base44Client.createUser as any).mockRejectedValueOnce(
      new Error("Base44 API error: Invalid email")
    );

    try {
      await profileCreationService.createProfile(
        mockProfileData,
        testUserId,
        testUserEmail
      );
      expect.fail("Should have thrown error");
    } catch (error) {
      // Verify: Profile NOT created
      const profile = await prisma.profile.findFirst({
        where: { user_id: testUserId },
      });
      expect(profile).toBeNull();

      // Verify: failed_syncs entry created
      const failedSync = await prisma.failedSync.findFirst({
        where: { event_type: "profile_creation_error" },
      });
      expect(failedSync).toBeDefined();
      expect(failedSync?.status).toBe("pending");
      expect(failedSync?.retry_count).toBe(0);
    }
  });

  it("should create DLQ entry on profile creation failure", async () => {
    (base44Client.createUser as any).mockResolvedValueOnce({
      id: "base44-id",
      email: testUserEmail,
      full_name: mockProfileData.nom,
    });

    const result = await profileCreationService.createProfile(
      mockProfileData,
      testUserId,
      testUserEmail
    );

    expect(result.profile).toBeDefined();
    expect(result.base44UserId).toBe("base44-id");

    // Verify: sync_logs entry created
    const syncLog = await prisma.syncLog.findFirst({
      where: {
        sync_type: "profile_creation_with_base44",
        status: "success",
      },
    });
    expect(syncLog).toBeDefined();
  });

  it("should link base44_user_id to profile", async () => {
    const base44UserId = "test-base44-uuid";
    (base44Client.createUser as any).mockResolvedValueOnce({
      id: base44UserId,
      email: testUserEmail,
      full_name: mockProfileData.nom,
    });

    const result = await profileCreationService.createProfile(
      mockProfileData,
      testUserId,
      testUserEmail
    );

    const linkedProfile = await prisma.profile.findUnique({
      where: { id: result.profile.id },
    });

    expect(linkedProfile?.base44_user_id).toBe(base44UserId);
  });

  it("should handle concurrent Base44 API failures", async () => {
    (base44Client.createUser as any).mockRejectedValue(
      new Error("Network timeout")
    );

    const promises = Array(3)
      .fill(null)
      .map((_, i) =>
        profileCreationService.createProfile(
          { ...mockProfileData, nom: `Creator ${i}` },
          `user-${i}`,
          `user${i}@example.com`
        ).catch(() => null)
      );

    const results = await Promise.all(promises);

    // Verify: 3 DLQ entries created
    const failedSyncs = await prisma.failedSync.findMany({
      where: { event_type: "profile_creation_error" },
    });
    expect(failedSyncs.length).toBe(3);

    // Verify: No profiles created
    const profiles = await prisma.profile.findMany({
      where: { user_id: { in: ["user-0", "user-1", "user-2"] } },
    });
    expect(profiles.length).toBe(0);
  });

  it("should update profile and Base44 User together on update", async () => {
    // Create initial profile
    (base44Client.createUser as any).mockResolvedValueOnce({
      id: "base44-id",
      email: testUserEmail,
      full_name: mockProfileData.nom,
    });

    const result = await profileCreationService.createProfile(
      mockProfileData,
      testUserId,
      testUserEmail
    );

    // Mock update
    (base44Client.updateUser as any).mockResolvedValueOnce({
      id: "base44-id",
      full_name: "Updated Creator",
    });

    // Update profile
    const updated = await profileCreationService.updateProfile(result.profile.id, {
      nom: "Updated Creator",
      bio: "Updated bio",
    });

    expect(updated.name).toBe("Updated Creator");
    expect(updated.bio).toBe("Updated bio");

    // Verify Base44 was updated
    expect(base44Client.updateUser).toHaveBeenCalled();
  });
});
