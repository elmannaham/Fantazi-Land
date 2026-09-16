import { supabase } from './supabase';
import * as SecureStore from 'expo-secure-store';
import type { UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string | undefined;
  role: UserRole;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (data.session?.access_token) {
    await SecureStore.setItemAsync('supabase-access-token', data.session.access_token);
  }

  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  await SecureStore.deleteItemAsync('supabase-access-token');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email,
    role: 'client',
  };
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.access_token) {
      await SecureStore.setItemAsync('supabase-access-token', session.access_token);
    }

    if (event === 'SIGNED_OUT') {
      await SecureStore.deleteItemAsync('supabase-access-token');
      callback(null);
    } else if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email,
        role: 'client',
      });
    }
  });
}
