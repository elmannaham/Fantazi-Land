import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants";

// Detect environment and use appropriate storage
function getStorageAdapter() {
  // Check if we're in React Native/Expo environment
  if (typeof window === "undefined" && typeof process !== "undefined") {
    // Server-side or React Native environment
    // For React Native, import and use expo-secure-store
    // For Node.js server-side, we don't need storage (should use service role key)
    try {
      // Try to import expo-secure-store if available
      const SecureStore = require("expo-secure-store");
      return {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };
    } catch {
      // Fall back to memory storage for server-side
      const memoryStore = new Map<string, string>();
      return {
        getItem: (key: string) => Promise.resolve(memoryStore.get(key) ?? null),
        setItem: (key: string, value: string) => {
          memoryStore.set(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          memoryStore.delete(key);
          return Promise.resolve();
        },
      };
    }
  }

  // Browser/web environment - use localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  // Fallback to memory storage
  const memoryStore = new Map<string, string>();
  return {
    getItem: (key: string) => Promise.resolve(memoryStore.get(key) ?? null),
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
      return Promise.resolve();
    },
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const storageAdapter = getStorageAdapter();

  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseInstance;
}

// Default export for convenience
export const supabase = getSupabaseClient();
