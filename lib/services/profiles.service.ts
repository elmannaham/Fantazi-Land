import Papa from "papaparse";
import { profilesRepository, type ProfileFilters } from "@/lib/repositories/profiles.repository";
import { syncService } from "@/lib/services/sync.service";
import { createServiceClient } from "@/lib/supabase";
import {
  createProfileSchema,
  updateProfileSchema,
  csvProfileRowSchema,
} from "@/lib/schemas";
import { validationError, notFoundError } from "@/lib/errors";
import type { Profile, ProfileWithStats } from "@/lib/types";

export class ProfilesService {
  private adminClient = createServiceClient();

  /**
   * Liste les profils avec filtres et pagination
   */
  async getProfiles(filters: ProfileFilters = {}) {
    return profilesRepository.findAll(filters);
  }

  /**
   * Détail d'un profil par son ID
   */
  async getProfileById(
    id: string,
    options: { includeMedia?: boolean; includeReviews?: boolean; reviewLimit?: number } = {}
  ): Promise<ProfileWithStats> {
    const profile = await profilesRepository.findById(id, options);
    if (!profile) {
      throw notFoundError(`Le profil avec l'ID ${id} n'existe pas`);
    }
    return profile;
  }

  /**
   * Création d'un profil avec validation et synchronisation Storage
   */
  async createProfile(data: unknown, userId?: string): Promise<Profile> {
    const validated = createProfileSchema.parse(data);

    // Vérifier si un profil existe déjà pour ce user
    if (userId) {
      const existing = await profilesRepository.findByUserId(userId);
      if (existing) {
        throw validationError("Un profil existe déjà pour cet utilisateur");
      }
    }

    const newProfile = await profilesRepository.create({
      user_id: userId || null,
      name: validated.name,
      category: validated.category,
      bio: validated.bio,
      avatar_url: validated.avatarUrl,
      base_rate: validated.baseRate,
      currency: validated.currency,
      instagram_url: validated.instagram,
      tiktok_url: validated.tiktok,
      twitter_url: validated.twitter,
      website_url: validated.website,
      is_public: validated.isPublic,
      is_available: validated.isAvailable,
      availability_calendar: validated.availabilityCalendar,
    });

    // Initialiser les stats de performance par défaut
    await this.adminClient.from("performance_stats").insert({
      profile_id: newProfile.id,
      total_projects: 0,
      total_reviews: 0,
      avg_rating: 5.0,
      completion_rate: 100,
      response_time_hours: 4,
    });

    // Synchronisation Storage en arrière-plan
    syncService.syncDbToStorage(newProfile).catch((err: any) => {
      console.error("Échec sync automatique lors de la création:", err);
    });

    return newProfile;
  }

  /**
   * Mise à jour d'un profil
   */
  async updateProfile(id: string, data: unknown): Promise<Profile> {
    const validated = updateProfileSchema.parse(data);
    const existing = await profilesRepository.findById(id);
    if (!existing) {
      throw notFoundError("Profil introuvable");
    }

    const updates: Partial<Profile> = {};
    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.category !== undefined) updates.category = validated.category;
    if (validated.bio !== undefined) updates.bio = validated.bio;
    if (validated.avatarUrl !== undefined) updates.avatar_url = validated.avatarUrl;
    if (validated.baseRate !== undefined) updates.base_rate = validated.baseRate;
    if (validated.currency !== undefined) updates.currency = validated.currency;
    if (validated.instagram !== undefined) updates.instagram_url = validated.instagram;
    if (validated.tiktok !== undefined) updates.tiktok_url = validated.tiktok;
    if (validated.twitter !== undefined) updates.twitter_url = validated.twitter;
    if (validated.website !== undefined) updates.website_url = validated.website;
    if (validated.isPublic !== undefined) updates.is_public = validated.isPublic;
    if (validated.isAvailable !== undefined) updates.is_available = validated.isAvailable;
    if (validated.availabilityCalendar !== undefined)
      updates.availability_calendar = validated.availabilityCalendar;

    const updatedProfile = await profilesRepository.update(id, updates);

    // Synchroniser vers le Storage
    syncService.syncDbToStorage(updatedProfile).catch((err: any) => {
      console.error("Échec sync automatique lors de la mise à jour:", err);
    });

    return updatedProfile;
  }

  /**
   * Suppression d'un profil
   */
  async deleteProfile(id: string): Promise<void> {
    const existing = await profilesRepository.findById(id);
    if (!existing) {
      throw notFoundError("Profil introuvable");
    }
    await profilesRepository.delete(id);
  }

  /**
   * Import par lot via fichier CSV (Canal 2)
   */
  async importCsv(csvContent: string): Promise<{
    inserted: number;
    failed: number;
    results: Array<{ name: string; status: "success" | "error"; profileId?: string; error?: string }>;
  }> {
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      throw validationError(`Erreur de parsing CSV: ${parseResult.errors[0]?.message}`);
    }

    const results: Array<{ name: string; status: "success" | "error"; profileId?: string; error?: string }> = [];
    let inserted = 0;
    let failed = 0;

    for (let index = 0; index < parseResult.data.length; index++) {
      const row = parseResult.data[index];
      const rowName = row.name || `Ligne ${index + 1}`;

      try {
        const validated = csvProfileRowSchema.parse(row);

        const profile = await profilesRepository.create({
          name: validated.name,
          category: validated.category,
          bio: validated.bio || null,
          base_rate: validated.baseRate || null,
          currency: validated.currency || "EUR",
          instagram_url: validated.instagram || null,
          tiktok_url: validated.tiktok || null,
          twitter_url: validated.twitter || null,
          website_url: validated.website || null,
          is_available: validated.isAvailable,
          is_public: true,
        });

        // Stats initiales
        await this.adminClient.from("performance_stats").insert({
          profile_id: profile.id,
          total_projects: 0,
          total_reviews: 0,
          avg_rating: 5.0,
          completion_rate: 100,
          response_time_hours: 4,
        });

        // Déclencher sync Storage en tâche de fond
        syncService.syncDbToStorage(profile).catch((e: any) => console.error("Sync error import CSV:", e));

        results.push({ name: validated.name, status: "success", profileId: profile.id });
        inserted++;
      } catch (err: any) {
        failed++;
        results.push({
          name: rowName,
          status: "error",
          error: err instanceof Error ? err.message : "Erreur inconnue",
        });
      }
    }

    return { inserted, failed, results };
  }
}

export const profilesService = new ProfilesService();
