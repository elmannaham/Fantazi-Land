// Supabase Edge Function: retry-failed-syncs
// Invoqué par CRON Supabase (ex: */10 * * * *) pour vider la Dead Letter Queue
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (_req) => {
  try {
    const { data: failedItems, error: fetchErr } = await supabase
      .from("failed_syncs")
      .select("*")
      .in("status", ["pending", "retrying"])
      .lt("retry_count", 3)
      .limit(20);

    if (fetchErr) throw fetchErr;

    let successCount = 0;
    let failCount = 0;

    for (const item of failedItems || []) {
      const nextRetry = item.retry_count + 1;
      try {
        if (item.event_type === "storage_to_db" && item.source_data?.folderName) {
          // Re-invoquer sync-storage-to-db-v2
          const res = await fetch(`${supabaseUrl}/functions/v1/sync-storage-to-db-v2`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: item.source_data.folderName }),
          });

          if (!res.ok) throw new Error(await res.text());
        } else if (item.event_type === "db_to_storage" && item.source_data?.profileId) {
          // Re-invoquer sync-db-to-storage
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", item.source_data.profileId)
            .single();

          if (profile) {
            const res = await fetch(`${supabaseUrl}/functions/v1/sync-db-to-storage`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${supabaseServiceKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ profile }),
            });

            if (!res.ok) throw new Error(await res.text());
          }
        }

        // Marquer résolu
        await supabase
          .from("failed_syncs")
          .update({
            status: "resolved",
            retry_count: nextRetry,
            resolved_at: new Date().toISOString(),
            last_attempted_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        successCount++;
      } catch (err: any) {
        failCount++;
        const finalStatus = nextRetry >= item.max_retries ? "failed" : "pending";
        await supabase
          .from("failed_syncs")
          .update({
            status: finalStatus,
            retry_count: nextRetry,
            error_message: err.message,
            last_attempted_at: new Date().toISOString(),
          })
          .eq("id", item.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: (failedItems || []).length,
        resolved: successCount,
        failed: failCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
