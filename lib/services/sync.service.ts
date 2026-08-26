import { createServiceClient } from "@/lib/supabase";
import { dlqRepository } from "@/lib/repositories/dlq.repository";
import type { Profile } from "@/lib/types";

export interface DecodedStorageFolder {
  name: string;
  category: string;
  metadata: Record<string, any>;
  rawFolderName: string;
}

export class SyncService {
  private adminClient = createServiceClient();
  private bucketName = "profiles";

  /**
   * Encode un nom de dossier pour le bucket Storage :
   * Format : "{Sanitized_Name}_{Category}_{Base64_JSON}"
   */
  encodeFolderName(profile: Partial<Profile>): string {
    const cleanName = (profile.name || "Unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    const category = (profile.category || "Lifestyle").replace(/[^a-zA-Z0-9_-]/g, "_");

    const metadata = {
      bio: profile.bio || "",
      baseRate: profile.base_rate,
      currency: profile.currency || "EUR",
      instagram: profile.instagram_url,
      tiktok: profile.tiktok_url,
      website: profile.website_url,
      isAvailable: profile.is_available ?? true,
      syncedAt: new Date().toISOString(),
    };

    const base64 = Buffer.from(JSON.stringify(metadata)).toString("base64");
    return `${cleanName}_${category}_${base64}`;
  }

  /**
   * Décode un nom de dossier Storage
   */
  decodeFolderName(folderName: string): DecodedStorageFolder {
    const parts = folderName.split("_");
    if (parts.length < 3) {
      throw new Error(`Format de dossier invalide: attendu 'Nom_Categorie_Base64', reçu '${folderName}'`);
    }

    const base64 = parts[parts.length - 1];
    const category = parts[parts.length - 2];
    const name = parts.slice(0, parts.length - 2).join(" ");

    let metadata: Record<string, any> = {};
    try {
      const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
      metadata = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Impossible de décoder les métadonnées JSON base64: ${(e as Error).message}`);
    }

    return {
      name,
      category,
      metadata,
      rawFolderName: folderName,
    };
  }

  /**
   * Synchronise un profil DB vers le Storage (Canal 1 & 2)
   */
  async syncDbToStorage(profile: Profile): Promise<string> {
    const startTime = Date.now();
    const folderName = this.encodeFolderName(profile);
    const placeholderPath = `${folderName}/.keep`;

    try {
      // Vérifier / Créer le dossier avec un fichier keep
      const { error: uploadError } = await this.adminClient.storage
        .from(this.bucketName)
        .upload(placeholderPath, new Uint8Array([0]), {
          upsert: true,
          contentType: "application/octet-stream",
        });

      if (uploadError && !uploadError.message.includes("already exists")) {
        throw uploadError;
      }

      // Mettre à jour profile.storage_folder_id et synced_at
      await this.adminClient
        .from("profiles")
        .update({
          storage_folder_id: folderName,
          synced_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      await dlqRepository.logAudit({
        profile_id: profile.id,
        sync_type: "db_to_storage",
        source_data: { profileId: profile.id, name: profile.name },
        result_data: { folderName },
        status: "success",
        duration_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return folderName;
    } catch (error) {
      const err = error as Error;
      await dlqRepository.logFailure("db_to_storage", { profileId: profile.id, folderName }, err);
      await dlqRepository.logAudit({
        profile_id: profile.id,
        sync_type: "db_to_storage",
        source_data: { profileId: profile.id },
        status: "error",
        error_message: err.message,
        duration_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  /**
   * Synchronise un dossier Storage vers la DB (Canal 3 - Webhook)
   */
  async syncStorageToDb(folderName: string): Promise<Profile> {
    const startTime = Date.now();
    try {
      const decoded = this.decodeFolderName(folderName);

      // Upsert du profil en DB
      const { data: existingProfile } = await this.adminClient
        .from("profiles")
        .select("id")
        .eq("storage_folder_id", folderName)
        .maybeSingle();

      let savedProfile: Profile;

      if (existingProfile) {
        const { data, error } = await this.adminClient
          .from("profiles")
          .update({
            name: decoded.name,
            category: decoded.category as any,
            bio: decoded.metadata.bio,
            base_rate: decoded.metadata.baseRate,
            currency: decoded.metadata.currency || "EUR",
            instagram_url: decoded.metadata.instagram,
            tiktok_url: decoded.metadata.tiktok,
            website_url: decoded.metadata.website,
            is_available: decoded.metadata.isAvailable ?? true,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        savedProfile = data as Profile;
      } else {
        const { data, error } = await this.adminClient
          .from("profiles")
          .insert({
            name: decoded.name,
            category: decoded.category as any,
            bio: decoded.metadata.bio,
            base_rate: decoded.metadata.baseRate,
            currency: decoded.metadata.currency || "EUR",
            instagram_url: decoded.metadata.instagram,
            tiktok_url: decoded.metadata.tiktok,
            website_url: decoded.metadata.website,
            is_available: decoded.metadata.isAvailable ?? true,
            storage_folder_id: folderName,
            synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        savedProfile = data as Profile;
      }

      await dlqRepository.logAudit({
        profile_id: savedProfile.id,
        sync_type: "storage_to_db",
        source_data: { folderName },
        result_data: { profileId: savedProfile.id },
        status: "success",
        duration_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return savedProfile;
    } catch (error) {
      const err = error as Error;
      await dlqRepository.logFailure("storage_to_db", { folderName }, err);
      await dlqRepository.logAudit({
        sync_type: "storage_to_db",
        source_data: { folderName },
        status: "error",
        error_message: err.message,
        duration_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  /**
   * Rejoue les synchronisations en échec avec backoff exponentiel
   */
  async retryFailedSyncs(): Promise<{ processed: number; resolved: number; failed: number }> {
    const failures = await dlqRepository.getPendingFailures(20);
    let resolved = 0;
    let failed = 0;

    for (const item of failures) {
      const newRetryCount = item.retry_count + 1;
      try {
        await dlqRepository.updateStatus(item.id, "retrying", newRetryCount);

        if (item.event_type === "storage_to_db" && item.source_data?.folderName) {
          await this.syncStorageToDb(item.source_data.folderName);
        } else if (item.event_type === "db_to_storage" && item.source_data?.profileId) {
          const { data: profile } = await this.adminClient
            .from("profiles")
            .select("*")
            .eq("id", item.source_data.profileId)
            .single();

          if (profile) {
            await this.syncDbToStorage(profile as Profile);
          }
        }

        await dlqRepository.updateStatus(item.id, "resolved", newRetryCount);
        resolved++;
      } catch (err) {
        const errorMsg = (err as Error).message;
        const status = newRetryCount >= item.max_retries ? "failed" : "pending";
        await dlqRepository.updateStatus(item.id, status, newRetryCount, errorMsg);
        failed++;
      }
    }

    return { processed: failures.length, resolved, failed };
  }
}

export const syncService = new SyncService();
