// Supabase Edge Function: retry-failed-syncs
// Invoqué par CRON Supabase (ex: 0 * * * *) hourly pour vider la Dead Letter Queue
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const nextAppUrl = Deno.env.get("NEXT_APP_URL") || "http://localhost:3000";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Exponential backoff delays: 1min, 5min, 30min
function getRetryDelay(retryCount: number): number {
  const delays = [60_000, 300_000, 1_800_000];
  return delays[Math.min(retryCount, delays.length - 1)];
}

// Check if enough time has passed since last attempt
function isReadyForRetry(lastAttempt: string, retryCount: number): boolean {
  const lastTime = new Date(lastAttempt).getTime();
  const now = Date.now();
  const delay = getRetryDelay(retryCount);
  return now - lastTime >= delay;
}

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
    let skippedCount = 0;

    for (const item of failedItems || []) {
      // Check if ready for retry based on exponential backoff
      if (!isReadyForRetry(item.last_attempted_at, item.retry_count)) {
        skippedCount++;
        continue;
      }

      const nextRetry = item.retry_count + 1;
      try {
        if (item.event_type === "storage_to_db" && item.source_data?.folderName) {
          // Re-invoke sync-storage-to-db-v2
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
          // Re-invoke sync-db-to-storage
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
        } else if (item.event_type === "profile_creation_error" && item.source_data?.profile_data) {
          // Re-invoke profile creation endpoint
          const profileData = item.source_data.profile_data;
          const userId = item.source_data.user_id;
          const userEmail = item.source_data.user_email;

          const res = await fetch(`${nextAppUrl}/api/profiles`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify(profileData),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Profile creation failed: ${errorText}`);
          }

          // Update profile with base44_user_id if returned
          const result = await res.json();
          if (result.profile?.id && result.base44_user_id) {
            await supabase
              .from("profiles")
              .update({ base44_user_id: result.base44_user_id })
              .eq("id", result.profile.id);
          }
        }

        // Mark as resolved
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
        const finalStatus = nextRetry >= item.max_retries ? "failed" : "retrying";
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
        skipped: skippedCount,
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
