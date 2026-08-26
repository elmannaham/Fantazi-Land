import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { unauthorizedError, forbiddenError } from "@/lib/errors";
import type { UserRole } from "@/lib/types";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: UserRole;
}

/**
 * Extrait le token Bearer depuis les headers ou les cookies de la requête
 */
export function extractAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Vérifier également les cookies de session Supabase
  const cookieToken = request.cookies.get("sb-access-token")?.value;
  return cookieToken || null;
}

/**
 * Authentifie l'utilisateur courant et récupère son rôle
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser> {
  const token = extractAuthToken(request);
  if (!token) {
    throw unauthorizedError("Token d'authentification manquant");
  }

  const adminClient = createServiceClient();
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);

  if (authError || !user) {
    throw unauthorizedError("Session expirée ou token invalide");
  }

  // Récupérer le rôle utilisateur depuis user_roles
  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (roleData?.role as UserRole) || "client";

  return {
    id: user.id,
    email: user.email,
    role,
  };
}

/**
 * Vérifie que l'utilisateur est authentifié et possède l'un des rôles requis
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await authenticateRequest(request);

  if (!allowedRoles.includes(user.role)) {
    throw forbiddenError(
      `Accès refusé: Rôle '${user.role}' insuffisant. Requis: ${allowedRoles.join(", ")}`
    );
  }

  return user;
}
