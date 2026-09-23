import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireInvitationCode } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { base44Client } from "@/lib/clients/base44.client";
import { syncService } from "@/lib/services/sync.service";
import { errorHandler, validationError } from "@/lib/errors";
import {
  createHostessProfile,
  MAX_GALLERY_IMAGES,
  type HostessOnboardingDeps,
} from "@/lib/services/hostess-onboarding.service";

export const dynamic = "force-dynamic";

const BUCKET = "HOTESS";
const FIELD_NAMES = [
  "name",
  "category",
  "bio",
  "baseRate",
  "currency",
  "instagram",
  "tiktok",
  "twitter",
  "website",
  "isAvailable",
] as const;

function storageDeps(): HostessOnboardingDeps {
  const storage = createServiceClient().storage.from(BUCKET);

  return {
    // Storage paths are case-sensitive, profile names are not: compare folders case-insensitively
    async listFolder(folder) {
      const { data, error } = await storage.list("", { limit: 1000 });
      if (error) throw new Error(`Bucket ${BUCKET} inaccessible: ${error.message}`);
      return (data ?? [])
        .map((item) => item.name)
        .filter((name) => name.toLowerCase() === folder.toLowerCase());
    },
    async upload(path, body, contentType) {
      const { error } = await storage.upload(path, body, { contentType, upsert: false });
      if (error) throw new Error(error.message);
    },
    async remove(paths) {
      if (paths.length > 0) await storage.remove(paths);
    },
    publicUrl: (path) => storage.getPublicUrl(path).data.publicUrl,
    createBase44User: (data) => base44Client.createUser(data as never),
    async deleteBase44User(id) {
      await base44Client.deleteUser(id);
    },
    onCreated: () => syncService.invalidateCache(),
  };
}

function asFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * POST /api/profiles/hostess (multipart/form-data)
 * Crée un profil d'hôtesse : utilisateur Base44 + dossier HOTESS avec avatar et
 * jusqu'à 5 photos. Réservé aux comptes connectés.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const form = await request.formData();
    requireInvitationCode(String(form.get("invitationCode") ?? ""));

    const images = form.getAll("images").map(asFile).filter((f): f is File => f !== null);
    if (images.length > MAX_GALLERY_IMAGES) {
      throw validationError(`${MAX_GALLERY_IMAGES} photos maximum dans la galerie`);
    }

    const fields = Object.fromEntries(
      FIELD_NAMES.map((name) => [name, form.get(name) ?? undefined]).filter(([, v]) => v !== undefined)
    );

    const profile = await createHostessProfile(storageDeps(), {
      user: { id: user.id, email: user.email },
      fields,
      avatar: asFile(form.get("avatar")),
      images,
    });

    return NextResponse.json(
      { success: true, profile: { ...profile, id: profile.folder.toLowerCase() } },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
