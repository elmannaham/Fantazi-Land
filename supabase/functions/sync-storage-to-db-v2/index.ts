// Supabase Edge Function: sync-storage-to-db-v2
// Déclenché par les webhooks Supabase Storage lors de la création d'un dossier
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const startTime = Date.now();
  try {
    const payload = await req.json();
    const folderName = payload?.record?.name || payload?.name;

    if (!folderName) {
      return new Response(JSON.stringify({ error: "Missing folderName" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parts = folderName.split("_");
    if (parts.length < 3) {
      throw new Error(`Format de dossier invalide: ${folderName}`);
    }

    const base64 = parts[parts.length - 1];
    const category = parts[parts.length - 2];
    const name = parts.slice(0, parts.length - 2).join(" ");

    const decodedJson = atob(base64);
    const metadata = JSON.parse(decodedJson);

    // Upsert profil
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("storage_folder_id", folderName)
      .maybeSingle();

    let profileId: string;

    if (existing) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name,
          category,
          bio: metadata.bio || null,
          base_rate: metadata.baseRate || null,
          currency: metadata.currency || "EUR",
          instagram_url: metadata.instagram || null,
          tiktok_url: metadata.tiktok || null,
          website_url: metadata.website || null,
          is_available: metadata.isAvailable ?? true,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      if (error) throw error;
      profileId = data.id;
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          name,
          category,
          bio: metadata.bio || null,
          base_rate: metadata.baseRate || null,
          currency: metadata.currency || "EUR",
          instagram_url: metadata.instagram || null,
          tiktok_url: metadata.tiktok || null,
          website_url: metadata.website || null,
          is_available: metadata.isAvailable ?? true,
          storage_folder_id: folderName,
          synced_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;
      profileId = data.id;

      // Stats initiales
      await supabase.from("performance_stats").insert({
        profile_id: profileId,
        total_projects: 0,
        total_reviews: 0,
        avg_rating: 5.0,
        completion_rate: 100,
      });
    }

    // Audit log
    await supabase.from("sync_logs").insert({
      profile_id: profileId,
      sync_type: "storage_to_db",
      source_data: { folderName },
      result_data: { profileId },
      status: "success",
      duration_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ success: true, action: "synced", profileId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const err = error as Error;

    // Enregistrement DLQ
    try {
      await supabase.from("failed_syncs").insert({
        event_type: "storage_to_db",
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
