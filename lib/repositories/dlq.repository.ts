import { createServiceClient } from "@/lib/supabase";

export interface FailedSyncRecord {
  id: string;
  event_type: string;
  source_data: any;
  error_message: string | null;
  error_stack: string | null;
  retry_count: number;
  max_retries: number;
  last_attempted_at: string;
  created_at: string;
  status: "pending" | "retrying" | "failed" | "resolved";
  resolved_at: string | null;
}

export interface SyncLogRecord {
  id: string;
  profile_id?: string;
  sync_type: string;
  source_data?: any;
  result_data?: any;
  status: "success" | "error" | "partial";
  error_message?: string;
  duration_ms?: number;
  created_at: string;
}

export class DLQRepository {
  private adminClient = createServiceClient();

  /**
   * Enregistre un échec de synchronisation dans la table failed_syncs (DLQ)
   */
  async logFailure(
    eventType: string,
    sourceData: any,
    error: Error | string
  ): Promise<void> {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : null;

    await this.adminClient.from("failed_syncs").insert({
      event_type: eventType,
      source_data: sourceData,
      error_message: errorMessage,
      error_stack: errorStack,
      status: "pending",
      retry_count: 0,
      max_retries: 3,
    });
  }

  /**
   * Récupère les échecs en attente de traitement
   */
  async getPendingFailures(limit = 50): Promise<FailedSyncRecord[]> {
    const { data, error } = await this.adminClient
      .from("failed_syncs")
      .select("*")
      .in("status", ["pending", "retrying"])
      .lt("retry_count", 3)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw new Error(`Erreur lecture DLQ: ${error.message}`);
    return data || [];
  }

  /**
   * Met à jour le statut d'un enregistrement DLQ
   */
  async updateStatus(
    id: string,
    status: "pending" | "retrying" | "resolved" | "failed",
    retryCount: number,
    errorMsg?: string
  ): Promise<void> {
    const updates: any = {
      status,
      retry_count: retryCount,
      last_attempted_at: new Date().toISOString(),
    };

    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }

    if (errorMsg) {
      updates.error_message = errorMsg;
    }

    await this.adminClient.from("failed_syncs").update(updates).eq("id", id);
  }

  /**
   * Enregistre un log d'audit de synchronisation
   */
  async logAudit(log: Partial<SyncLogRecord>): Promise<void> {
    try {
      await this.adminClient.from("sync_logs").insert(log);
    } catch (e) {
      console.error("Impossible d'écrire le log d'audit:", e);
    }
  }

  /**
   * Liste les logs récents pour le dashboard d'administration
   */
  async getRecentLogs(limit = 50): Promise<SyncLogRecord[]> {
    const { data, error } = await this.adminClient
      .from("sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Erreur lecture sync_logs: ${error.message}`);
    return data || [];
  }
}

export const dlqRepository = new DLQRepository();
