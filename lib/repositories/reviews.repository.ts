import { supabase, createServiceClient } from "@/lib/supabase";
import type { Review } from "@/lib/types";

export class ReviewsRepository {
  private client = supabase;
  private adminClient = createServiceClient();

  async findByProfileId(profileId: string, limit = 10): Promise<Review[]> {
    const { data, error } = await this.client
      .from("reviews")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Erreur récupération avis: ${error.message}`);
    return data || [];
  }

  async create(reviewData: Partial<Review>): Promise<Review> {
    const { data, error } = await this.client
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) throw new Error(`Erreur création avis: ${error.message}`);
    return data;
  }
}

export const reviewsRepository = new ReviewsRepository();
