import {
  Base44User,
  CreateBase44UserDto,
  UpdateBase44UserDto,
  Base44QueryParams,
} from "@/lib/types";
import { ApiError } from "@/lib/errors";

export class Base44Client {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    baseUrl: string = process.env.BASE44_API_URL || "https://agence-de-booking-crud-ec63fc9d.base44.app/api",
    apiKey: string = process.env.BASE44_API_KEY || "5f77c7690c884054ba1d3f2c75961284"
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  /**
   * Effectue un appel HTTP générique vers l'API Base44
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      api_key: this.apiKey,
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorDetails: string;
        try {
          const errorJson = await response.json();
          errorDetails = JSON.stringify(errorJson);
        } catch {
          errorDetails = await response.text();
        }

        throw new ApiError(
          response.status,
          `Erreur API Base44 [${response.status}]: ${errorDetails}`,
          "BASE44_API_ERROR"
        );
      }

      // Certaines réponses de suppression ou statut 204 peuvent être vides
      const text = await response.text();
      return text ? (JSON.parse(text) as T) : ({} as T);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        `Échec de connexion vers l'API Base44: ${err.message}`,
        "BASE44_NETWORK_ERROR"
      );
    }
  }

  // ── User Endpoints ─────────────────────────────────────────────

  /**
   * GET /entities/User
   * Récupère la liste des utilisateurs avec filtres, tri et pagination
   */
  async getUsers(params: Base44QueryParams = {}): Promise<Base44User[]> {
    const searchParams = new URLSearchParams();

    if (params.q) {
      searchParams.append("q", JSON.stringify(params.q));
    }
    if (params.limit !== undefined) {
      searchParams.append("limit", params.limit.toString());
    }
    if (params.skip !== undefined) {
      searchParams.append("skip", params.skip.toString());
    }
    if (params.sort_by) {
      searchParams.append("sort_by", params.sort_by);
    }

    const queryString = searchParams.toString();
    const endpoint = `/entities/User${queryString ? `?${queryString}` : ""}`;

    return this.request<Base44User[]>(endpoint, {
      method: "GET",
    });
  }

  /**
   * GET /entities/User/{User_id}
   * Récupère un utilisateur par son identifiant unique
   */
  async getUserById(userId: string): Promise<Base44User> {
    if (!userId) {
      throw new ApiError(400, "L'ID de l'utilisateur est requis", "VALIDATION_ERROR");
    }
    return this.request<Base44User>(`/entities/User/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
  }

  /**
   * POST /entities/User
   * Crée un nouvel utilisateur sur Base44
   */
  async createUser(data: CreateBase44UserDto): Promise<Base44User> {
    if (!data.email || !data.full_name || !data.role) {
      throw new ApiError(
        400,
        "Les champs email, full_name et role sont obligatoires",
        "VALIDATION_ERROR"
      );
    }

    return this.request<Base44User>("/entities/User", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT /entities/User/{User_id}
   * Met à jour les informations d'un utilisateur existant
   */
  async updateUser(userId: string, data: UpdateBase44UserDto): Promise<Base44User> {
    if (!userId) {
      throw new ApiError(400, "L'ID de l'utilisateur est requis", "VALIDATION_ERROR");
    }

    return this.request<Base44User>(`/entities/User/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE /entities/User/{User_id}
   * Supprime (soft-delete) un utilisateur Base44
   */
  async deleteUser(userId: string): Promise<{ success: boolean; id: string }> {
    if (!userId) {
      throw new ApiError(400, "L'ID de l'utilisateur est requis", "VALIDATION_ERROR");
    }

    await this.request<void>(`/entities/User/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });

    return { success: true, id: userId };
  }
}

export const base44Client = new Base44Client();
