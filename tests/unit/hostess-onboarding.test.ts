import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createHostessProfile,
  MAX_GALLERY_IMAGES,
  toStorageFolderName,
  type HostessOnboardingDeps,
} from "@/lib/services/hostess-onboarding.service";

/** jsdom Blob has no .text(); FileReader works in both jsdom and browsers. */
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function image(name = "photo.jpg", type = "image/jpeg", size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

const USER = { id: "user-1", email: "marie@example.test" };
const FIELDS = { name: "Marie-Claire Dupré", category: "Dinner & Show", bio: "Bio", baseRate: "800", currency: "CAD" };

function makeDeps(overrides: Partial<HostessOnboardingDeps> = {}) {
  const uploaded: string[] = [];
  const deps: HostessOnboardingDeps = {
    listFolder: vi.fn().mockResolvedValue([]),
    upload: vi.fn(async (path: string) => {
      uploaded.push(path);
    }),
    remove: vi.fn().mockResolvedValue(undefined),
    publicUrl: (path: string) => `https://cdn.test/HOTESS/${path}`,
    createBase44User: vi.fn().mockResolvedValue({ id: "b44-1" }),
    deleteBase44User: vi.fn().mockResolvedValue(undefined),
    onCreated: vi.fn(),
    ...overrides,
  };
  return { deps, uploaded };
}

describe("toStorageFolderName", () => {
  test("strips accents and unsafe characters and joins words with dashes", () => {
    expect(toStorageFolderName("  Marie-Claire Dupré! ")).toBe("Marie-Claire-Dupre");
  });

  test("never produces path separators or dots", () => {
    expect(toStorageFolderName("../../etc/passwd")).toBe("etc-passwd");
  });
});

describe("createHostessProfile", () => {
  let ctx: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    ctx = makeDeps();
  });

  test("creates the Base44 user, uploads avatar, images and descrip.json in the profile folder", async () => {
    const result = await createHostessProfile(ctx.deps, {
      user: USER,
      fields: FIELDS,
      avatar: image("me.png", "image/png"),
      images: [image("a.jpg"), image("b.webp", "image/webp")],
    });

    expect(ctx.deps.createBase44User).toHaveBeenCalledWith(
      expect.objectContaining({ email: USER.email, full_name: "Marie-Claire Dupré", role: "user" })
    );
    expect(ctx.uploaded).toEqual([
      "Marie-Claire-Dupre/Avatar.png",
      "Marie-Claire-Dupre/images/1.jpg",
      "Marie-Claire-Dupre/images/2.webp",
      "Marie-Claire-Dupre/descrip.json",
    ]);
    expect(result).toMatchObject({
      folder: "Marie-Claire-Dupre",
      base44UserId: "b44-1",
      avatarUrl: "https://cdn.test/HOTESS/Marie-Claire-Dupre/Avatar.png",
    });
    expect(result.imageUrls).toHaveLength(2);
    expect(ctx.deps.onCreated).toHaveBeenCalled();
  });

  test("writes the owner and Base44 ids into descrip.json", async () => {
    await createHostessProfile(ctx.deps, { user: USER, fields: FIELDS, avatar: image(), images: [] });

    const call = vi.mocked(ctx.deps.upload).mock.calls.find(([path]) => path.endsWith("descrip.json"));
    const json = JSON.parse(await readBlob(call?.[1] as Blob));
    expect(json).toMatchObject({
      nom: "Marie-Claire Dupré",
      categorie: "Dinner & Show",
      base_rate: 800,
      owner_user_id: "user-1",
      base44_user_id: "b44-1",
    });
  });

  test(`rejects more than ${MAX_GALLERY_IMAGES} gallery images before touching Base44 or storage`, async () => {
    const images = Array.from({ length: MAX_GALLERY_IMAGES + 1 }, (_, i) => image(`${i}.jpg`));

    await expect(
      createHostessProfile(ctx.deps, { user: USER, fields: FIELDS, avatar: image(), images })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(ctx.deps.createBase44User).not.toHaveBeenCalled();
    expect(ctx.deps.upload).not.toHaveBeenCalled();
  });

  test("rejects non-image files and oversized images", async () => {
    await expect(
      createHostessProfile(ctx.deps, {
        user: USER,
        fields: FIELDS,
        avatar: image("x.html", "text/html"),
        images: [],
      })
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      createHostessProfile(ctx.deps, {
        user: USER,
        fields: FIELDS,
        avatar: image(),
        images: [image("big.jpg", "image/jpeg", 11 * 1024 * 1024)],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rejects an unknown category", async () => {
    await expect(
      createHostessProfile(ctx.deps, {
        user: USER,
        fields: { ...FIELDS, category: "Inconnue" },
        avatar: image(),
        images: [],
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("returns 409 when a profile folder with that name already exists", async () => {
    ctx = makeDeps({ listFolder: vi.fn().mockResolvedValue(["Avatar.jpg"]) });

    await expect(
      createHostessProfile(ctx.deps, { user: USER, fields: FIELDS, avatar: image(), images: [] })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(ctx.deps.createBase44User).not.toHaveBeenCalled();
  });

  test("does not upload anything when Base44 fails", async () => {
    ctx = makeDeps({ createBase44User: vi.fn().mockRejectedValue(new Error("Base44 down")) });

    await expect(
      createHostessProfile(ctx.deps, { user: USER, fields: FIELDS, avatar: image(), images: [] })
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(ctx.deps.upload).not.toHaveBeenCalled();
  });

  test("rolls back uploaded files and the Base44 user when an upload fails", async () => {
    const uploaded: string[] = [];
    ctx = makeDeps({
      upload: vi.fn(async (path: string) => {
        if (path.endsWith("images/2.jpg")) throw new Error("storage down");
        uploaded.push(path);
      }),
    });

    await expect(
      createHostessProfile(ctx.deps, {
        user: USER,
        fields: FIELDS,
        avatar: image(),
        images: [image("a.jpg"), image("b.jpg")],
      })
    ).rejects.toMatchObject({ statusCode: 502 });

    expect(ctx.deps.remove).toHaveBeenCalledWith(uploaded);
    expect(ctx.deps.deleteBase44User).toHaveBeenCalledWith("b44-1");
    expect(ctx.deps.onCreated).not.toHaveBeenCalled();
  });
});
