import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const getUser = vi.fn();
const maybeSingle = vi.fn();
const findById = vi.fn();

vi.mock("@/lib/supabase", () => ({
  createServiceClient: () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

vi.mock("@/lib/repositories/profiles.repository", () => ({
  profilesRepository: { findById },
}));

const { requireProfileAccess, requireWebhookSecret, requireRole } = await import("@/lib/auth");

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://example.test/api/x", { headers });
}

function signIn(userId: string, options: { role?: string; appRole?: string } = {}) {
  getUser.mockResolvedValue({
    data: { user: { id: userId, email: "u@example.test", app_metadata: { role: options.appRole } } },
    error: null,
  });
  maybeSingle.mockResolvedValue({ data: options.role ? { role: options.role } : null });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireProfileAccess", () => {
  test("rejects a request without a token", async () => {
    await expect(requireProfileAccess(makeRequest(), "p1")).rejects.toMatchObject({ statusCode: 401 });
    expect(findById).not.toHaveBeenCalled();
  });

  test("rejects a signed-in user who does not own the profile", async () => {
    signIn("user-a");
    findById.mockResolvedValue({ id: "p1", user_id: "user-b" });

    await expect(
      requireProfileAccess(makeRequest({ authorization: "Bearer t" }), "p1")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("allows the profile owner", async () => {
    signIn("user-a");
    findById.mockResolvedValue({ id: "p1", user_id: "user-a" });

    const { user, profile } = await requireProfileAccess(makeRequest({ authorization: "Bearer t" }), "p1");

    expect(user.id).toBe("user-a");
    expect(profile.id).toBe("p1");
  });

  test("allows an admin on any profile", async () => {
    signIn("admin-1", { role: "admin" });
    findById.mockResolvedValue({ id: "p1", user_id: "someone-else" });

    await expect(
      requireProfileAccess(makeRequest({ authorization: "Bearer t" }), "p1")
    ).resolves.toMatchObject({ user: { role: "admin" } });
  });

  test("returns 404 when the profile does not exist", async () => {
    signIn("admin-1", { role: "admin" });
    findById.mockResolvedValue(null);

    await expect(
      requireProfileAccess(makeRequest({ authorization: "Bearer t" }), "missing")
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("requireRole", () => {
  test("falls back to app_metadata.role when user_roles has no row", async () => {
    signIn("admin-2", { appRole: "admin" });

    await expect(requireRole(makeRequest({ authorization: "Bearer t" }), ["admin"])).resolves.toMatchObject({
      role: "admin",
    });
  });

  test("ignores an unknown role value and treats the user as client", async () => {
    signIn("user-c", { appRole: "superuser" });

    await expect(
      requireRole(makeRequest({ authorization: "Bearer t" }), ["admin"])
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("requireWebhookSecret", () => {
  afterEach(() => {
    delete process.env.TEST_WEBHOOK_SECRET;
  });

  test("rejects every request when the secret is not configured", () => {
    expect(() =>
      requireWebhookSecret(makeRequest({ "x-webhook-secret": "anything" }), "TEST_WEBHOOK_SECRET")
    ).toThrow(expect.objectContaining({ statusCode: 401 }));
  });

  test("rejects a wrong secret", () => {
    process.env.TEST_WEBHOOK_SECRET = "expected-secret";

    expect(() =>
      requireWebhookSecret(makeRequest({ "x-webhook-secret": "wrong-secret!!" }), "TEST_WEBHOOK_SECRET")
    ).toThrow(expect.objectContaining({ statusCode: 401 }));
  });

  test("accepts the matching secret", () => {
    process.env.TEST_WEBHOOK_SECRET = "expected-secret";

    expect(() =>
      requireWebhookSecret(makeRequest({ "x-webhook-secret": "expected-secret" }), "TEST_WEBHOOK_SECRET")
    ).not.toThrow();
  });
});
