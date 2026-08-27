import { createServiceClient } from "@/lib/supabase";
import { dlqRepository } from "@/lib/repositories/dlq.repository";
import type { Profile, MediaAsset, ProfileWithStats } from "@/lib/types";
import catalogData from "@/data/creators-catalog.json";

export interface DecodedStorageFolder {
  name: string;
  category: string;
  metadata: Record<string, any>;
  rawFolderName: string;
}

export interface SyncResult {
  success: boolean;
  bucketName: string;
  syncedProfilesCount: number;
  syncedMediaCount: number;
  durationMs: number;
  profiles: any[];
  errors: string[];
}

export class SyncService {
  private adminClient = createServiceClient();
  private defaultBucket = "HOTESS";
  private cache: { profiles: ProfileWithStats[]; timestamp: number } | null = null;
  private cacheTTL = 30000; // 30 secondes de cache mémoire ultra-rapide

  /**
   * Encode un nom de dossier pour le bucket Storage :
   * Format : "{Sanitized_Name}__{Sanitized_Category}__{Base64_JSON}"
   */
  encodeFolderName(profile: Partial<Profile>): string {
    const cleanName = (profile.name || "Unknown").trim();
    const category = (profile.category || "Photographie").trim();

    const metadata = {
      name: cleanName,
      category,
      bio: profile.bio || "",
      baseRate: profile.base_rate,
      currency: profile.currency || "CAD",
      instagram: profile.instagram_url,
      tiktok: profile.tiktok_url,
      website: profile.website_url,
      isAvailable: profile.is_available ?? true,
      syncedAt: new Date().toISOString(),
    };

    const base64 = Buffer.from(JSON.stringify(metadata)).toString("base64");
    const slugName = cleanName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const slugCategory = category.replace(/[^a-zA-Z0-9_-]/g, "_");

    return `${slugName}__${slugCategory}__${base64}`;
  }

  /**
   * Décode un nom de dossier Storage
   */
  decodeFolderName(folderName: string): DecodedStorageFolder {
    let base64 = "";
    let category = "";
    let name = "";

    if (folderName.includes("__")) {
      const parts = folderName.split("__");
      if (parts.length >= 3) {
        base64 = parts[parts.length - 1];
        category = parts[parts.length - 2].replace(/_/g, " ");
        name = parts.slice(0, parts.length - 2).join(" ").replace(/_/g, " ");
      }
    } else {
      const parts = folderName.split("_");
      if (parts.length >= 3) {
        base64 = parts[parts.length - 1];
        category = parts[parts.length - 2];
        name = parts.slice(0, parts.length - 2).join(" ");
      }
    }

    if (!base64) {
      throw new Error(`Format de dossier invalide: attendu 'Nom__Categorie__Base64', reçu '${folderName}'`);
    }

    let metadata: Record<string, any> = {};
    try {
      const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
      metadata = JSON.parse(jsonStr);
      if (metadata.name) name = metadata.name;
      if (metadata.category) category = metadata.category;
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
   * Nettoie et parse du JSON potentiellement malformé (trailing commas, etc.)
   */
  private safeParseJson(jsonString: string): Record<string, any> | null {
    try {
      return JSON.parse(jsonString);
    } catch {
      try {
        const cleaned = jsonString.replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  /**
   * Synchronise un profil DB vers le Storage
   */
  async syncDbToStorage(profile: Profile): Promise<string> {
    const startTime = Date.now();
    const folderName = this.encodeFolderName(profile);
    const placeholderPath = `${folderName}/.keep`;

    try {
      const { error: uploadError } = await this.adminClient.storage
        .from(this.defaultBucket)
        .upload(placeholderPath, new Uint8Array([0]), {
          upsert: true,
          contentType: "application/octet-stream",
        });

      if (uploadError && !uploadError.message.includes("already exists")) {
        throw uploadError;
      }

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
      throw err;
    }
  }

  /**
   * Synchronise un dossier Storage vers la DB (Webhook)
   */
  async syncStorageToDb(folderName: string): Promise<Profile> {
    const startTime = Date.now();
    try {
      const decoded = this.decodeFolderName(folderName);

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
            currency: decoded.metadata.currency || "CAD",
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
            currency: decoded.metadata.currency || "CAD",
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
      throw err;
    }
  }

  /**
   * Rejoue les synchronisations en échec
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

  /**
   * Synchronisation complète et optimisée de tous les dossiers du bucket HOTESS
   */
  async syncAllFromBucket(bucketName = this.defaultBucket): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let syncedMediaCount = 0;
    const syncedProfiles: any[] = [];

    try {
      const { data: rootItems, error: listError } = await this.adminClient.storage
        .from(bucketName)
        .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

      if (listError) {
        throw new Error(`Erreur d'accès au bucket [${bucketName}]: ${listError.message}`);
      }

      const folderItems = (rootItems || []).filter(
        (item) => !item.name.includes(".") && !item.name.startsWith(".")
      );

      const profilePromises = folderItems.map(async (folder) => {
        try {
          const folderName = folder.name;
          const { data: subFiles } = await this.adminClient.storage
            .from(bucketName)
            .list(folderName, { limit: 50 });

          let avatarUrl = "";
          let metadataObj: Record<string, any> = {};
          const seenFilenames = new Set<string>();
          const galleryUrls: string[] = [];

          for (const file of subFiles || []) {
            const fileNameLower = file.name.toLowerCase();

            if (fileNameLower.startsWith("avatar") && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
              const { data } = this.adminClient.storage
                .from(bucketName)
                .getPublicUrl(`${folderName}/${file.name}`);
              avatarUrl = data.publicUrl;
            }

            if (fileNameLower.includes("descrip") && /\.(json|txt)$/i.test(file.name)) {
              try {
                const { data: blob } = await this.adminClient.storage
                  .from(bucketName)
                  .download(`${folderName}/${file.name}`);
                if (blob) {
                  const text = await blob.text();
                  const parsed = this.safeParseJson(text);
                  if (parsed) metadataObj = { ...metadataObj, ...parsed };
                }
              } catch {
                // Ignore download error
              }
            }
          }

          // Scanner sous-dossiers
          const { data: subDirItems } = await this.adminClient.storage
            .from(bucketName)
            .list(folderName, { limit: 50 });
          const subDirs = (subDirItems || [])
            .filter((i) => !i.name.includes(".") && !i.name.startsWith("."))
            .map((d) => d.name);

          const checkDirs = subDirs.length > 0 ? subDirs : ["images"];

          for (const dir of checkDirs) {
            const { data: imagesInSub } = await this.adminClient.storage
              .from(bucketName)
              .list(`${folderName}/${dir}`, { limit: 100 });

            if (imagesInSub && imagesInSub.length > 0) {
              for (const img of imagesInSub) {
                if (/\.(jpg|jpeg|png|webp|gif|mp4|webm)$/i.test(img.name)) {
                  const lowerName = img.name.toLowerCase();
                  if (!seenFilenames.has(lowerName)) {
                    seenFilenames.add(lowerName);
                    const { data } = this.adminClient.storage
                      .from(bucketName)
                      .getPublicUrl(`${folderName}/${dir}/${img.name}`);
                    galleryUrls.push(data.publicUrl);
                  }
                }
              }
            }
          }

          const cleanName =
            folderName.length > 2
              ? folderName.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : metadataObj.nom || metadataObj.name || folderName;

          const category = metadataObj.categorie || metadataObj.category || "Photographie";
          const bio =
            metadataObj.bio ||
            `Hôtesse d'exception professionnelle (${cleanName}) synchronisée depuis le stockage.`;
          const baseRate = parseFloat(metadataObj.base_rate || metadataObj.baseRate) || 500;
          const currency = metadataObj.currency || "CAD";

          const mediaAssets: MediaAsset[] = galleryUrls.map((url, idx) => ({
            id: `${folderName}-img-${idx}`,
            profile_id: folderName,
            file_url: url,
            file_type: url.endsWith(".mp4") ? "video" : "image",
            file_size_bytes: 250000,
            uploaded_by: null,
            created_at: new Date().toISOString(),
          }));

          syncedMediaCount += mediaAssets.length;

          const profileObj: ProfileWithStats = {
            id: folderName.toLowerCase(),
            user_id: folderName.toLowerCase(),
            name: cleanName,
            category: category as any,
            bio,
            avatar_url: avatarUrl || (galleryUrls[0] ?? null),
            base_rate: baseRate,
            currency,
            instagram_url: metadataObj.instagram || metadataObj.TELEGRAM || null,
            tiktok_url: metadataObj.tiktok || null,
            twitter_url: metadataObj.twitter || null,
            website_url: metadataObj.website || null,
            is_public: true,
            is_available: true,
            availability_calendar: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
            storage_folder_id: folderName,
            media_assets: mediaAssets,
            performance_stats: {
              id: `perf-${folderName}`,
              profile_id: folderName,
              avg_rating: 5.0,
              total_projects: 0,
              total_reviews: 0,
              completion_rate: 100,
              response_time_hours: 4,
              repeat_client_rate: 95,
              last_project_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };

          return profileObj;
        } catch (folderErr) {
          const msg = (folderErr as Error).message;
          errors.push(`Erreur sur le dossier ${folder.name}: ${msg}`);
          return null;
        }
      });

      const results = await Promise.all(profilePromises);
      results.forEach((p) => {
        if (p) syncedProfiles.push(p);
      });

      this.cache = {
        profiles: syncedProfiles,
        timestamp: Date.now(),
      };

      const durationMs = Date.now() - startTime;

      return {
        success: errors.length === 0 || syncedProfiles.length > 0,
        bucketName,
        syncedProfilesCount: syncedProfiles.length,
        syncedMediaCount,
        durationMs,
        profiles: syncedProfiles,
        errors,
      };
    } catch (globalErr) {
      const err = globalErr as Error;
      return {
        success: false,
        bucketName,
        syncedProfilesCount: 0,
        syncedMediaCount: 0,
        durationMs: Date.now() - startTime,
        profiles: [],
        errors: [err.message],
      };
    }
  }

  /**
   * Récupère les profils synchronisés avec cache intelligent
   */
  async getCachedSyncedProfiles(): Promise<ProfileWithStats[]> {
    if (this.cache && Date.now() - this.cache.timestamp < this.cacheTTL) {
      return this.cache.profiles;
    }

    const syncRes = await this.syncAllFromBucket();
    if (syncRes.profiles.length > 0) {
      return syncRes.profiles;
    }

    return (catalogData || []).map((c: any) => ({
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
        id: `perf-${c.id}`,
        profile_id: c.id,
        avg_rating: 5.0,
        total_projects: 0,
        total_reviews: 0,
        completion_rate: 100,
        response_time_hours: 4,
        repeat_client_rate: 95,
        last_project_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })) as ProfileWithStats[];
  }
}

export const syncService = new SyncService();
