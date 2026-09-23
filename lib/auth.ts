import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { profilesRepository } from "@/lib/repositories/profiles.repository";
import { unauthorizedError, forbiddenError, notFoundError } from "@/lib/errors";
import type { Profile, UserRole } from "@/lib/types";

const VALID_ROLES: readonly UserRole[] = ["client", "creator", "admin"];

function toUserRole(value: unknown): UserRole | null {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value)
    ? (value as UserRole)
    : null;
}

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

  // user_roles en priorité, puis app_metadata.role (modifiable uniquement côté serveur / dashboard)
  const role = toUserRole(roleData?.role) ?? toUserRole(user.app_metadata?.role) ?? "client";

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

/**
 * Autorise l'accès à un profil : administrateur, ou propriétaire du profil (profiles.user_id).
 * Renvoie l'utilisateur et le profil pour éviter une seconde lecture.
 */
export async function requireProfileAccess(
  request: NextRequest,
  profileId: string
): Promise<{ user: AuthenticatedUser; profile: Profile }> {
  const user = await authenticateRequest(request);
  const profile = await profilesRepository.findById(profileId);

  if (!profile) {
    throw notFoundError("Profil introuvable");
  }

  if (user.role !== "admin" && profile.user_id !== user.id) {
    throw forbiddenError("Accès refusé: ce profil ne vous appartient pas");
  }

  return { user, profile };
}

/**
 * Vérifie le secret partagé d'un webhook (header x-webhook-secret).
 * Refuse toute requête si le secret n'est pas configuré côté serveur.
 */
export function requireWebhookSecret(request: NextRequest, envVar: string): void {
  const expected = process.env[envVar];
  const provided = request.headers.get("x-webhook-secret");

  if (!expected || !provided) {
    throw unauthorizedError("Signature de webhook manquante");
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    throw unauthorizedError("Signature de webhook invalide");
  }
}

/**
 * Vérifie le code d'invitation de création de profil (ADMIN_CREATION_PASSWORD).
 * Refuse toute création si la variable n'est pas configurée côté serveur.
 */
export function requireInvitationCode(provided: string | null | undefined): void {
  const expected = process.env.ADMIN_CREATION_PASSWORD;
  if (!expected) {
    throw forbiddenError("La création de profil n'est pas encore ouverte (code d'invitation non configuré)");
  }
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided ?? "");
  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    throw unauthorizedError("Code d'invitation invalide");
  }
}
