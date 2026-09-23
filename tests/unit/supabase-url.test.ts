import { describe, expect, test } from "vitest";
import { resolveSupabaseUrl } from "@/lib/supabase";

describe("resolveSupabaseUrl", () => {
  test("keeps a valid https URL", () => {
    expect(resolveSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
  });

  test("falls back when the value is a vercel env pull placeholder", () => {
    expect(resolveSupabaseUrl("[SENSITIVE]")).toBe("http://127.0.0.1:54321");
  });

  test("falls back when the value is missing or uses another protocol", () => {
    expect(resolveSupabaseUrl(undefined)).toBe("http://127.0.0.1:54321");
    expect(resolveSupabaseUrl("ftp://abc.supabase.co")).toBe("http://127.0.0.1:54321");
  });
});
