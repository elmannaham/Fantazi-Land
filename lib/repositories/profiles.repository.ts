import { supabase, createServiceClient } from "@/lib/supabase";
import type { Profile, ProfileWithStats } from "@/lib/types";
import catalogData from "@/data/creators-catalog.json";

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
   * Robuste avec repli sur le catalogue synchronisé
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

    try {
      // 1. Tenter la requête directe sur la table profiles
      let query = this.adminClient
        .from("profiles")
        .select("*", { count: "exact" });

      if (isPublic !== undefined) {
        query = query.eq("is_public", isPublic);
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      query = query.order("created_at", { ascending: false });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        const profiles = data.map((item: any) => ({
          ...item,
          performance_stats: {
            avg_rating: 5.0,
            total_projects: 0,
            total_reviews: 0,
            completion_rate: 100,
            response_time_hours: 4,
          },
        })) as ProfileWithStats[];

        return {
          profiles,
          total: count ?? profiles.length,
        };
      }
    } catch (e) {
      console.warn("Notice: Table profiles query fallback:", (e as Error).message);
    }

    // 2. Repli sur le catalogue de créatrices synchronisé depuis le stockage S3
    let catalogList = (catalogData || []).map((c: any) => ({
      id: c.id,
      user_id: c.id,
      name: c.name,
      category: c.category,
      bio: c.bio,
      avatar_url: c.avatar,
      base_rate: parseFloat(c.baseRate) || 500,
      currency: "CAD",
      instagram_url: null,
      tiktok_url: null,
      twitter_url: null,
      website_url: null,
      is_public: true,
      is_available: true,
      availability_calendar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      storage_folder_id: c.name,
      performance_stats: {
        avg_rating: 5.0,
        total_projects: 0,
        total_reviews: 0,
        completion_rate: 100,
        response_time_hours: 4,
      },
    })) as ProfileWithStats[];

    if (category) {
      catalogList = catalogList.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      catalogList = catalogList.filter((p) => p.name?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q));
    }

    const total = catalogList.length;
    const paginated = catalogList.slice(offset, offset + limit);

    return {
      profiles: paginated,
      total,
    };
  }

  /**
   * Récupère un profil par son ID
   */
  async findById(
    id: string,
    options: { includeMedia?: boolean; includeReviews?: boolean; reviewLimit?: number } = {}
  ): Promise<ProfileWithStats | null> {
    try {
      const { data, error } = await this.adminClient
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          performance_stats: {
            avg_rating: 5.0,
            total_projects: 0,
            total_reviews: 0,
            completion_rate: 100,
            response_time_hours: 4,
          },
        } as ProfileWithStats;
      }
    } catch {
      // ignore
    }

    // Chercher dans le catalogue synchronisé
    const found = (catalogData || []).find((c: any) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    if (found) {
      return {
        id: found.id,
        user_id: found.id,
        name: found.name,
        category: found.category,
        bio: found.bio,
        avatar_url: found.avatar,
        base_rate: parseFloat(found.baseRate) || 500,
        currency: "CAD",
        instagram_url: null,
        tiktok_url: null,
        twitter_url: null,
        website_url: null,
        is_public: true,
        is_available: true,
        availability_calendar: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        storage_folder_id: found.name,
        performance_stats: {
          avg_rating: 5.0,
          total_projects: 0,
          total_reviews: 0,
          completion_rate: 100,
          response_time_hours: 4,
        },
      } as ProfileWithStats;
    }

    return null;
  }

  /**
   * Récupère le profil d'un utilisateur par son user_id
   */
  async findByUserId(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.adminClient
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) return data as Profile;
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Création d'un profil
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
