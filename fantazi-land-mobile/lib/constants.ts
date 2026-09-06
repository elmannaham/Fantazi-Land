export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://uytihmscyjpwpdhqvnbw.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const CATEGORIES = [
  'Tous',
  'Photographie',
  'Vidéographie',
  'Contenu Mode',
  'Beauté',
  'Lifestyle',
  'Gaming',
] as const;

export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
