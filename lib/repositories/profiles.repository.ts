import { supabase, createServiceClient } from "@/lib/supabase";
import type { Profile, ProfileWithStats } from "@/lib/types";

export interface ProfileFilters {
  category?: string;
  search?: string;
  sortBy?: "rating" | "newest" | "projects";
  limit?: number;
  offset?: number;
  isPublic?: boolean;
}

export class ProfilesRepository {
  private client = supabase;
  private adminClient = createServiceClient();

  /**
   * Récupère la liste des profils avec pagination et filtres
   * Optimisé pour éviter le problème N+1 via jointures Supabase
   */
  async findAll(filters: ProfileFilters = {}): Promise<{ profiles: ProfileWithStats[]; total: number }> {
    const {
      category,
      search,
      sortBy = "newest",
      limit = 20,
      offset = 0,
      isPublic = true,
    } = filters;

    let query = this.client
      .from("profiles")
      .select(
        `
        id,
        user_id,
        name,
        category,
        bio,
        avatar_url,
        base_rate,
        currency,
        instagram_url,
        tiktok_url,
        twitter_url,
        website_url,
        is_public,
        is_available,
        availability_calendar,
        created_at,
        updated_at,
        synced_at,
        storage_folder_id,
        performance_stats (
          avg_rating,
          total_projects,
          total_reviews,
          completion_rate,
          response_time_hours
        )
      `,
        { count: "exact" }
      );

    if (isPublic !== undefined) {
      query = query.eq("is_public", isPublic);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Tri
    if (sortBy === "rating") {
      query = query.order("performance_stats(avg_rating)", { ascending: false, nullsFirst: false });
    } else if (sortBy === "projects") {
      query = query.order("performance_stats(total_projects)", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erreur récupération profils: ${error.message}`);
    }

    // Formatage des stats relationnelles
    const profiles = (data || []).map((item: any) => ({
      ...item,
      performance_stats: Array.isArray(item.performance_stats)
        ? item.performance_stats[0] || null
        : item.performance_stats,
    })) as ProfileWithStats[];

    return {
      profiles,
      total: count ?? profiles.length,
    };
  }

  /**
   * Récupère un profil par son ID avec ses relations (médias, avis, stats)
   */
  async findById(
    id: string,
    options: { includeMedia?: boolean; includeReviews?: boolean; reviewLimit?: number } = {}
  ): Promise<ProfileWithStats | null> {
    const { includeMedia = true, includeReviews = true, reviewLimit = 5 } = options;

    let selectQuery = `
      *,
      performance_stats (*)
    `;

    if (includeMedia) {
      selectQuery += `, media_assets (*)`;
    }

    if (includeReviews) {
      selectQuery += `, reviews (*)`;
    }

    const { data, error } = await this.client
      .from("profiles")
      .select(selectQuery)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Non trouvé
      throw new Error(`Erreur récupération profil [${id}]: ${error.message}`);
    }

    if (!data) return null;

    const rawData = data as any;
    const result = {
      ...rawData,
      performance_stats: Array.isArray(rawData.performance_stats)
        ? rawData.performance_stats[0] || null
        : rawData.performance_stats,
    };

    if (includeReviews && Array.isArray(result.reviews)) {
      result.reviews = result.reviews.slice(0, reviewLimit);
    }

    return result as ProfileWithStats;
  }

  /**
   * Récupère le profil d'un utilisateur par son `user_id`
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Erreur recherche profil user [${userId}]: ${error.message}`);
    return data as Profile | null;
  }

  /**
   * Création d'un profil (utilise le client admin pour bypasser RLS lors du setup / creation)
   */
  async create(profileData: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.adminClient
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur création profil: ${error.message}`);
    }

    return data as Profile;
  }

  /**
   * Mise à jour d'un profil existant
   */
  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.adminClient
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise à jour profil [${id}]: ${error.message}`);
    }

    return data as Profile;
  }

  /**
   * Suppression d'un profil
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.adminClient.from("profiles").delete().eq("id", id);
    if (error) {
      throw new Error(`Erreur suppression profil [${id}]: ${error.message}`);
    }
  }

  /**
   * Insertion par lot (Batch) pour l'import CSV
   */
  async batchCreate(profiles: Partial<Profile>[]): Promise<Profile[]> {
    const { data, error } = await this.adminClient
      .from("profiles")
      .insert(profiles)
      .select();

    if (error) {
      throw new Error(`Erreur import par lot: ${error.message}`);
    }

    return data as Profile[];
  }
}

export const profilesRepository = new ProfilesRepository();
