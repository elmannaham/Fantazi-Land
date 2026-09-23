"use client";

import { supabase } from "@/lib/supabase";

/**
 * fetch() qui ajoute le jeton de session Supabase (Authorization: Bearer).
 * À utiliser pour toutes les routes API protégées (admin, propriétaire du profil).
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(input, { ...init, headers });
}
