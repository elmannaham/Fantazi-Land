import { createClient, SupabaseClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "http://127.0.0.1:54321";

/**
 * Returns the configured Supabase URL, or the local fallback when the value is
 * missing or not a valid http(s) URL (e.g. a "[SENSITIVE]" placeholder left by
 * `vercel env pull`). A bad value must not crash every page at import time.
 */
export function resolveSupabaseUrl(value: string | undefined): string {
  if (!value) return FALLBACK_SUPABASE_URL;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : FALLBACK_SUPABASE_URL;
  } catch {
    return FALLBACK_SUPABASE_URL;
  }
}

const supabaseUrl = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseS3Endpoint =
  process.env.NEXT_PUBLIC_SUPABASE_S3_ENDPOINT ||
  "https://uytihmscyjpwpdhqvnbw.storage.supabase.co/storage/v1/s3";

export function createServiceClient(): SupabaseClient {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_service_key";
  return createClient(supabaseUrl, serviceKey);
}
