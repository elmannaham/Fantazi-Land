// Supabase Edge Function: sync-db-to-storage
// Déclenché par PostgreSQL triggers ou API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const startTime = Date.now();
  try {
    const payload = await req.json();
    const profile = payload.record || payload.profile;

    if (!profile || !profile.id || !profile.name) {
      return new Response(JSON.stringify({ error: "Invalid profile data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    const base64 = btoa(JSON.stringify(metadata));
    const folderName = `${cleanName}_${category}_${base64}`;

    // Upload d'un fichier sentinelle .keep pour créer le dossier
    const { error: storageError } = await supabase.storage
      .from("profiles")
      .upload(`${folderName}/.keep`, new Uint8Array([0]), {
        upsert: true,
      });

    if (storageError && !storageError.message.includes("already exists")) {
      throw storageError;
    }

    // Mise à jour de storage_folder_id et synced_at
    await supabase
      .from("profiles")
      .update({
        storage_folder_id: folderName,
        synced_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    // Audit log
    await supabase.from("sync_logs").insert({
      profile_id: profile.id,
      sync_type: "db_to_storage",
      source_data: { profileId: profile.id, name: profile.name },
      result_data: { folderName },
      status: "success",
      duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ success: true, folderName }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const err = error as Error;

    try {
      await supabase.from("failed_syncs").insert({
        event_type: "db_to_storage",
        source_data: { error: err.message },
        error_message: err.message,
        status: "pending",
      });
    } catch (_) {}

    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
