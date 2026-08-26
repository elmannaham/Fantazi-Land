import { prisma } from "@/lib/prisma";
import { base44Client } from "@/lib/clients/base44.client";
import { Base44UserService } from "./base44-user.service";
import { ApiError } from "@/lib/errors";
import type { Profile } from "@prisma/client";

export interface CreateProfileInput {
  nom: string;
  categorie: string;
  bio: string;
  avatar_url?: string;
  base_rate?: number;
  currency?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

export class ProfileCreationService {
  /**
   * Crée atomiquement un profil Fantazi-Land + Base44 User
   * Transaction: si Base44 échoue → profil rollback automatique
   */
  async createProfile(
    data: CreateProfileInput,
    userId: string,
    userEmail: string
  ): Promise<{
    profile: Profile;
    base44UserId: string;
    syncLogId: string;
  }> {
    const startTime = Date.now();
    let createdProfile: Profile | null = null;
    let base44UserId: string | null = null;

    try {
      // ── STEP 1: Créer profil Fantazi-Land dans transaction ──
      createdProfile = await prisma.profile.create({
        data: {
          user_id: userId,
          name: data.nom,
          category: data.categorie as any,
          bio: data.bio,
          avatar_url: data.avatar_url || null,
          base_rate: data.base_rate || null,
          currency: data.currency || "EUR",
          instagram_url: data.instagram || null,
          tiktok_url: data.tiktok || null,
          twitter_url: data.twitter || null,
          website_url: data.website || null,
          is_public: true,
          is_available: true,
          performance_stats: {
            create: {
              avg_rating: 5.0,
              total_projects: 0,
              completion_rate: 100,
              response_time_hours: 4,
            },
          },
        },
        include: { performance_stats: true },
      });

      // ── STEP 2: Créer Base44 User ──
      const base44Data = Base44UserService.mapProfileToBase44User(
        createdProfile,
        userEmail
      );

      const base44User = await base44Client.createUser(base44Data);
      base44UserId = base44User.id;

      // ── STEP 3: Link Base44 ID to Profile ──
      const linkedProfile = await prisma.profile.update({
        where: { id: createdProfile.id },
        data: { base44_user_id: base44UserId },
      });

      // ── STEP 4: Log succès ──
      const syncLog = await prisma.syncLog.create({
        data: {
          profile_id: linkedProfile.id,
          sync_type: "profile_creation_with_base44",
          source_data: {
            profile_id: linkedProfile.id,
            base44_user_id: base44UserId,
            user_email: userEmail,
          },
          result_data: {
            profile_id: linkedProfile.id,
            base44_user_id: base44UserId,
          },
          status: "success",
          duration_ms: Date.now() - startTime,
        },
      });

      return {
        profile: linkedProfile,
        base44UserId,
        syncLogId: syncLog.id,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      // ── ROLLBACK: Supprimer Base44 User si créé ──
      if (base44UserId) {
        try {
          await base44Client.deleteUser(base44UserId);
          console.log(`Rolled back Base44 User: ${base44UserId}`);
        } catch (deleteError) {
          console.error(
            `Failed to rollback Base44 User ${base44UserId}:`,
            deleteError
          );
          // Continue even if rollback fails
        }
      }

      // Profil Prisma est automatiquement rollback en cas d'erreur

      // ── DLQ: Enregistrer l'erreur ──
      await prisma.failedSync.create({
        data: {
          event_type: "profile_creation_error",
          source_data: {
            user_id: userId,
            user_email: userEmail,
            profile_data: data,
            attempted_base44_user_id: base44UserId,
          } as any,
          error_message: errorMessage,
          error_stack: errorStack || null,
          status: "pending",
          retry_count: 0,
          max_retries: 3,
        },
      });

      // ── Log erreur ──
      await prisma.syncLog.create({
        data: {
          profile_id: createdProfile?.id || null,
          sync_type: "profile_creation_with_base44",
          source_data: {
            user_id: userId,
            user_email: userEmail,
          } as any,
          status: "error",
          error_message: errorMessage,
          duration_ms: durationMs,
        },
      });

      throw new ApiError(
        500,
        `Erreur création profil + Base44: ${errorMessage}`,
        "PROFILE_CREATION_ERROR"
      );
    }
  }

  /**
   * Met à jour profil ET Base44 User simultanément
   */
  async updateProfile(
    profileId: string,
    data: Partial<CreateProfileInput>
  ): Promise<Profile> {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new ApiError(404, "Profil non trouvé", "PROFILE_NOT_FOUND");
    }

    try {
      // Mettre à jour profil
      const updatedProfile = await prisma.profile.update({
        where: { id: profileId },
        data: {
          name: data.nom || profile.name,
          category: (data.categorie as any) || profile.category,
          bio: data.bio !== undefined ? data.bio : profile.bio,
          avatar_url: data.avatar_url !== undefined ? data.avatar_url : profile.avatar_url,
          base_rate: data.base_rate !== undefined ? data.base_rate : profile.base_rate,
          currency: data.currency || profile.currency,
          instagram_url: data.instagram !== undefined ? data.instagram : profile.instagram_url,
          tiktok_url: data.tiktok !== undefined ? data.tiktok : profile.tiktok_url,
          twitter_url: data.twitter !== undefined ? data.twitter : profile.twitter_url,
          website_url: data.website !== undefined ? data.website : profile.website_url,
          updated_at: new Date(),
        },
      });

      // Mettre à jour Base44 User si base44_user_id existe
      if (profile.base44_user_id) {
        const base44Data = Base44UserService.mapProfileToBase44UserUpdate(
          updatedProfile
        );
        await base44Client.updateUser(profile.base44_user_id, base44Data);
      }

      return updatedProfile;
    } catch (error) {
      throw new ApiError(
        500,
        `Erreur mise à jour profil: ${error instanceof Error ? error.message : String(error)}`,
        "PROFILE_UPDATE_ERROR"
      );
    }
  }
}

export const profileCreationService = new ProfileCreationService();
