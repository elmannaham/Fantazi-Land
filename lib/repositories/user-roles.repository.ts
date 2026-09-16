import { createServiceClient } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

// Postgres unique_violation
const UNIQUE_VIOLATION = "23505";

export class RoleAlreadySetError extends Error {
  constructor() {
    super("Le rôle de cet utilisateur est déjà défini.");
    this.name = "RoleAlreadySetError";
  }
}

export class UserRolesRepository {
  private adminClient = createServiceClient();

  /**
   * Attribue le rôle d'un utilisateur une seule fois (première attribution
   * uniquement). Un `insert` — et non un `upsert` — garantit qu'un
   * utilisateur ne peut pas changer son propre rôle après coup (ex: client
   * -> creator) en rappelant cet endpoint self-service ; toute modification
   * ultérieure doit passer par un flux admin dédié.
   */
  async setRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await this.adminClient
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      if (error.code === UNIQUE_VIOLATION) throw new RoleAlreadySetError();
      throw new Error(`Erreur écriture user_roles: ${error.message}`);
    }
  }
}

export const userRolesRepository = new UserRolesRepository();
