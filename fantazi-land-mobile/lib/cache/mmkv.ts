import { CACHE_TTL_MS } from '../constants';
import type { ProfileWithStats } from '../types';

let mmkvInstance: any = null;
try {
  const mmkvModule = require('react-native-mmkv');
  if (typeof mmkvModule.createMMKV === 'function') {
    mmkvInstance = mmkvModule.createMMKV();
  } else if (typeof mmkvModule.MMKV === 'function') {
    mmkvInstance = new mmkvModule.MMKV();
  }
} catch {
  // Fallback memory store if MMKV native module is unavailable
}

if (!mmkvInstance) {
  const memoryStore = new Map<string, string>();
  mmkvInstance = {
    set: (key: string, value: string) => memoryStore.set(key, value),
    getString: (key: string) => memoryStore.get(key) || null,
    delete: (key: string) => memoryStore.delete(key),
  };
}

export const storage = mmkvInstance;

export function cacheProfiles(profiles: ProfileWithStats[]) {
  storage.set('cached-profiles', JSON.stringify(profiles));
  storage.set('cached-profiles-ts', Date.now().toString());
}

export function getCachedProfiles(): ProfileWithStats[] | null {
  const data = storage.getString('cached-profiles');
  const ts = storage.getString('cached-profiles-ts');

  if (!data || !ts) return null;

  const age = Date.now() - Number(ts);
  if (age > CACHE_TTL_MS) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearCache() {
  storage.delete('cached-profiles');
  storage.delete('cached-profiles-ts');
}
