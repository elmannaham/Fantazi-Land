/**
 * Base44 CRM API Client
 *
 * Provides a universal API client for interacting with Base44 CRM
 * from both web (Vite + React) and mobile (Expo + React Native) environments.
 *
 * Configuration:
 * - Requires BASE44_API_URL environment variable (API endpoint)
 * - Requires BASE44_API_KEY environment variable (authentication token)
 */

function getBase44Config() {
  const apiUrl = typeof process !== "undefined" && process.env.BASE44_API_URL
    ? process.env.BASE44_API_URL
    : typeof import.meta !== "undefined" && import.meta.env?.VITE_BASE44_API_URL
    ? import.meta.env.VITE_BASE44_API_URL
    : null;

  if (!apiUrl) {
    throw new Error(
      "VITE_BASE44_API_URL environment variable is required. " +
      "Set BASE44_API_URL (mobile) or VITE_BASE44_API_URL (web)."
    );
  }

  const apiKey = typeof process !== "undefined" && process.env.BASE44_API_KEY
    ? process.env.BASE44_API_KEY
    : typeof import.meta !== "undefined" && import.meta.env?.VITE_BASE44_API_KEY
    ? import.meta.env.VITE_BASE44_API_KEY
    : "";

  return { apiUrl, apiKey };
}

export class Base44Client {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    const config = getBase44Config();
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;

    if (!this.apiKey) {
      console.warn(
        "Base44 API key not configured. Set BASE44_API_KEY or VITE_BASE44_API_KEY environment variable."
      );
    }
  }

  /**
   * Make an authenticated request to the Base44 API
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Base44 API Error (${response.status}): ${error || response.statusText}`
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json();
  }

  // Profile operations
  async getProfile(id: string): Promise<any> {
    return this.request("GET", `/profiles/${id}`);
  }

  async listProfiles(filters?: Record<string, any>): Promise<any[]> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    const endpoint = `/profiles${query.toString() ? `?${query}` : ""}`;
    const response = await this.request<{ data: any[] }>("GET", endpoint);
    return response.data || [];
  }

  async createProfile(data: Record<string, any>): Promise<any> {
    return this.request("POST", "/profiles", data);
  }

  async updateProfile(id: string, data: Record<string, any>): Promise<any> {
    return this.request("PUT", `/profiles/${id}`, data);
  }

  async deleteProfile(id: string): Promise<void> {
    await this.request("DELETE", `/profiles/${id}`);
  }

  // Booking operations
  async getBooking(id: string): Promise<any> {
    return this.request("GET", `/bookings/${id}`);
  }

  async listBookings(filters?: Record<string, any>): Promise<any[]> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    const endpoint = `/bookings${query.toString() ? `?${query}` : ""}`;
    const response = await this.request<{ data: any[] }>("GET", endpoint);
    return response.data || [];
  }

  async createBooking(data: Record<string, any>): Promise<any> {
    return this.request("POST", "/bookings", data);
  }

  async updateBooking(id: string, data: Record<string, any>): Promise<any> {
    return this.request("PUT", `/bookings/${id}`, data);
  }

  async deleteBooking(id: string): Promise<void> {
    await this.request("DELETE", `/bookings/${id}`);
  }

  // Review operations
  async getReview(id: string): Promise<any> {
    return this.request("GET", `/reviews/${id}`);
  }

  async listReviews(filters?: Record<string, any>): Promise<any[]> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
    }
    const endpoint = `/reviews${query.toString() ? `?${query}` : ""}`;
    const response = await this.request<{ data: any[] }>("GET", endpoint);
    return response.data || [];
  }

  async createReview(data: Record<string, any>): Promise<any> {
    return this.request("POST", "/reviews", data);
  }

  async updateReview(id: string, data: Record<string, any>): Promise<any> {
    return this.request("PUT", `/reviews/${id}`, data);
  }

  async deleteReview(id: string): Promise<void> {
    await this.request("DELETE", `/reviews/${id}`);
  }
}

// Singleton instance
let base44Instance: Base44Client | null = null;

export function getBase44Client(): Base44Client {
  if (!base44Instance) {
    base44Instance = new Base44Client();
  }
  return base44Instance;
}

// Default export for convenience
export const base44 = getBase44Client();
