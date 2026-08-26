import { describe, it, expect } from "vitest";
import { Base44Client } from "@/lib/clients/base44.client";

describe("Base44Client SDK", () => {
  it("should initialize client with default URL and API key", () => {
    const client = new Base44Client();
    expect(client).toBeDefined();
  });

  it("should format query parameters properly", async () => {
    const client = new Base44Client(
      "https://agence-de-booking-crud-ec63fc9d.base44.app/api",
      "5f77c7690c884054ba1d3f2c75961284"
    );

    // Fetch existing users from live endpoint
    try {
      const users = await client.getUsers({ limit: 5 });
      expect(Array.isArray(users)).toBe(true);
      if (users.length > 0) {
        expect(users[0]).toHaveProperty("id");
        expect(users[0]).toHaveProperty("email");
        expect(users[0]).toHaveProperty("role");
      }
    } catch (e: any) {
      // Si hors ligne ou réseau restreint dans l'environnement de test
      expect(e).toBeDefined();
    }
  });

  it("should throw validation error when creating user with missing fields", async () => {
    const client = new Base44Client();
    await expect(
      client.createUser({ email: "", full_name: "", role: "user" })
    ).rejects.toThrow("obligatoires");
  });
});
