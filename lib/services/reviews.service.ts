import { reviewsRepository } from "@/lib/repositories/reviews.repository";
import { profilesRepository } from "@/lib/repositories/profiles.repository";
import { createServiceClient } from "@/lib/supabase";
import { createReviewSchema } from "@/lib/schemas";
import { notFoundError } from "@/lib/errors";
import type { Review } from "@/lib/types";

export class ReviewsService {
  private adminClient = createServiceClient();

  /**
   * Récupère les avis d'un profil
   */
  async getReviewsByProfile(profileId: string, limit = 10): Promise<Review[]> {
    return reviewsRepository.findByProfileId(profileId, limit);
  }

  /**
   * Crée un avis et met à jour automatiquement les stats de performance du profil
   */
  async createReview(data: unknown, clientId?: string): Promise<Review> {
    const validated = createReviewSchema.parse(data);

    // Vérifier l'existence du profil
    const profile = await profilesRepository.findById(validated.profileId);
    if (!profile) {
      throw notFoundError("Le profil concerné par l'avis est introuvable");
    }

    // Création de l'avis
    const review = await reviewsRepository.create({
      profile_id: validated.profileId,
      client_id: clientId || null,
      client_name: validated.clientName || "Client Fantazi-Land",
      rating: validated.rating,
      comment: validated.comment || null,
      is_verified: !!clientId,
    });

    // Recalculer les statistiques de performance de la créatrice
    await this.updateProfileStats(validated.profileId);

    return review;
  }

  /**
   * Recalcule la note moyenne et le total d'avis pour un profil
   */
  private async updateProfileStats(profileId: string): Promise<void> {
    const allReviews = await reviewsRepository.findByProfileId(profileId, 1000);
    const totalReviews = allReviews.length;

    if (totalReviews > 0) {
      const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = Number((sum / totalReviews).toFixed(2));

      await this.adminClient
        .from("performance_stats")
        .upsert(
          {
            profile_id: profileId,
            total_reviews: totalReviews,
            avg_rating: avgRating,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );
    }
  }
}

export const reviewsService = new ReviewsService();
