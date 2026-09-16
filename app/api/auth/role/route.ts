import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { userRolesRepository, RoleAlreadySetError } from "@/lib/repositories/user-roles.repository";
import { setUserRoleSchema } from "@/lib/schemas";
import { errorHandler, conflictError } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * Auto-attribution du rôle au moment de l'inscription (Créateur/Créatrice ou
 * Fan). Deux garde-fous contre l'élévation de privilèges :
 * - Le schéma exclut volontairement "admin".
 * - Le rôle ne peut être défini qu'une seule fois (voir
 *   UserRolesRepository.setRole) : un utilisateur ne peut pas rappeler cet
 *   endpoint pour passer de "client" à "creator" (ou inversement) après coup.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const body = await request.json();
    const { role } = setUserRoleSchema.parse(body);

    await userRolesRepository.setRole(user.id, role);

    return NextResponse.json({ success: true, role });
  } catch (error) {
    if (error instanceof RoleAlreadySetError) {
      return errorHandler(conflictError(error.message));
    }
    return errorHandler(error);
  }
}
