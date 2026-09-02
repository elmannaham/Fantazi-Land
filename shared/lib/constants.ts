export const API_BASE_URL = typeof process !== "undefined" && process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL
  : typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

export const SUPABASE_URL = (() => {
  const url = typeof process !== "undefined" && process.env.EXPO_PUBLIC_SUPABASE_URL
    ? process.env.EXPO_PUBLIC_SUPABASE_URL
    : typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : null;

  if (!url) {
    throw new Error(
      "VITE_SUPABASE_URL environment variable is required. " +
      "Set EXPO_PUBLIC_SUPABASE_URL (mobile) or VITE_SUPABASE_URL (web)."
    );
  }

  return url;
})();

export const SUPABASE_ANON_KEY = typeof process !== "undefined" && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  : typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : "";

export const CATEGORIES = [
  "Tous",
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
] as const;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const;

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
