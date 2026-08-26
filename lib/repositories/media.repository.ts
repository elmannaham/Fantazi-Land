import { supabase, createServiceClient } from "@/lib/supabase";
import type { MediaAsset } from "@/lib/types";

export class MediaRepository {
  private client = supabase;
  private adminClient = createServiceClient();

  async findByProfileId(profileId: string): Promise<MediaAsset[]> {
    const { data, error } = await this.client
      .from("media_assets")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Erreur récupération médias: ${error.message}`);
    return data || [];
  }

  async create(mediaData: Partial<MediaAsset>): Promise<MediaAsset> {
    const { data, error } = await this.client
      .from("media_assets")
      .insert(mediaData)
      .select()
      .single();

    if (error) throw new Error(`Erreur enregistrement média: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("media_assets").delete().eq("id", id);
    if (error) throw new Error(`Erreur suppression média [${id}]: ${error.message}`);
  }
}

export const mediaRepository = new MediaRepository();
