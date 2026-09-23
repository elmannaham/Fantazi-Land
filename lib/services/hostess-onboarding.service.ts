import { z } from "zod";
import { ApiError, conflictError, validationError } from "@/lib/errors";
import { CATEGORIES } from "@/lib/constants";

/**
 * New hostess profiles live in the HOTESS storage bucket, like the existing ones:
 *   HOTESS/<Folder>/Avatar.<ext>
 *   HOTESS/<Folder>/images/<n>.<ext>   (up to MAX_GALLERY_IMAGES)
 *   HOTESS/<Folder>/descrip.json       (profile metadata, owner and Base44 ids)
 * and get a matching user in the Base44 CRM.
 */

export const MAX_GALLERY_IMAGES = 5;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CURRENCY_CODES = ["CAD", "EUR", "USD", "GBP"] as const;
const MAX_FOLDER_LENGTH = 40;

const optionalUrl = z
  .string()
  .trim()
  .url("Lien invalide")
  .max(300)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const hostessProfileSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(60, "Nom trop long"),
  category: z.enum(CATEGORIES as [string, ...string[]], {
    errorMap: () => ({ message: "Catégorie inconnue" }),
  }),
  bio: z.string().trim().max(1000, "Bio trop longue").optional(),
  baseRate: z.coerce.number().positive("Tarif invalide").max(100000).optional(),
  currency: z.enum(CURRENCY_CODES).default("CAD"),
  instagram: optionalUrl,
  tiktok: optionalUrl,
  twitter: optionalUrl,
  website: optionalUrl,
  isAvailable: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .default(true),
});

export type HostessProfileFields = z.infer<typeof hostessProfileSchema>;

export interface HostessOnboardingDeps {
  /** File names directly inside a folder of the bucket (empty when the folder does not exist). */
  listFolder: (folder: string) => Promise<string[]>;
  upload: (path: string, body: Blob, contentType: string) => Promise<void>;
  remove: (paths: string[]) => Promise<void>;
  publicUrl: (path: string) => string;
  createBase44User: (data: Record<string, unknown>) => Promise<{ id: string }>;
  deleteBase44User: (id: string) => Promise<void>;
  /** Called after a successful creation (e.g. to refresh the profile cache). */
  onCreated?: () => void;
}

export interface CreateHostessInput {
  user: { id: string; email?: string };
  fields: unknown;
  avatar: File | null;
  images: File[];
}

export interface CreatedHostessProfile {
  folder: string;
  name: string;
  avatarUrl: string;
  imageUrls: string[];
  base44UserId: string;
}

/** Storage-safe folder name: no accents, no path separators, words joined by dashes. */
export function toStorageFolderName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // strip accents (combining marks)
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FOLDER_LENGTH)
    .replace(/-+$/g, "");
}

function imageExtension(file: File, label: string): string {
  const ext = IMAGE_EXTENSIONS[file.type];
  if (!ext) throw validationError(`${label} : format non supporté (JPG, PNG ou WebP uniquement)`);
  if (file.size > MAX_IMAGE_BYTES) throw validationError(`${label} : fichier trop lourd (10 Mo maximum)`);
  if (file.size === 0) throw validationError(`${label} : fichier vide`);
  return ext;
}

function parseFields(fields: unknown): HostessProfileFields {
  const parsed = hostessProfileSchema.safeParse(fields);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
  }
  return parsed.data;
}

function buildMetadata(
  fields: HostessProfileFields,
  user: CreateHostessInput["user"],
  base44UserId: string
): Record<string, unknown> {
  return {
    nom: fields.name,
    name: fields.name,
    categorie: fields.category,
    category: fields.category,
    bio: fields.bio ?? "",
    base_rate: fields.baseRate ?? null,
    currency: fields.currency,
    instagram: fields.instagram ?? null,
    tiktok: fields.tiktok ?? null,
    twitter: fields.twitter ?? null,
    website: fields.website ?? null,
    is_available: fields.isAvailable,
    owner_user_id: user.id,
    base44_user_id: base44UserId,
    created_at: new Date().toISOString(),
  };
}

/**
 * Creates a hostess profile: validates everything first, then the Base44 user,
 * then the storage files. Any storage failure rolls back uploaded files and the
 * Base44 user so no half-created profile is left behind.
 */
export async function createHostessProfile(
  deps: HostessOnboardingDeps,
  input: CreateHostessInput
): Promise<CreatedHostessProfile> {
  if (!input.user.email) throw validationError("Votre compte n'a pas d'adresse e-mail");

  const fields = parseFields(input.fields);
  if (!input.avatar) throw validationError("La photo de profil est obligatoire");
  if (input.images.length > MAX_GALLERY_IMAGES) {
    throw validationError(`${MAX_GALLERY_IMAGES} photos maximum dans la galerie`);
  }

  const avatarExt = imageExtension(input.avatar, "Photo de profil");
  const imageExts = input.images.map((file, i) => imageExtension(file, `Photo ${i + 1}`));

  const folder = toStorageFolderName(fields.name);
  if (folder.length < 2) throw validationError("Nom invalide");

  const existing = await deps.listFolder(folder);
  if (existing.length > 0) throw conflictError("Ce nom de profil est déjà utilisé");

  let base44UserId: string;
  try {
    const base44User = await deps.createBase44User({
      email: input.user.email,
      full_name: fields.name,
      role: "user",
      category: fields.category,
      description: fields.bio ?? "",
      base_rate: fields.baseRate ?? null,
      currency: fields.currency,
      instagram: fields.instagram ?? null,
      tiktok: fields.tiktok ?? null,
      twitter: fields.twitter ?? null,
      website: fields.website ?? null,
    });
    base44UserId = base44User.id;
  } catch {
    throw new ApiError(502, "Impossible de créer le compte dans Base44. Réessayez plus tard.", "BASE44_ERROR");
  }

  const uploadedPaths: string[] = [];
  const avatarPath = `${folder}/Avatar.${avatarExt}`;
  const imagePaths = imageExts.map((ext, i) => `${folder}/images/${i + 1}.${ext}`);

  try {
    await deps.upload(avatarPath, input.avatar, input.avatar.type);
    uploadedPaths.push(avatarPath);

    for (const [i, file] of input.images.entries()) {
      await deps.upload(imagePaths[i], file, file.type);
      uploadedPaths.push(imagePaths[i]);
    }

    const metadataPath = `${folder}/descrip.json`;
    const metadata = new Blob([JSON.stringify(buildMetadata(fields, input.user, base44UserId), null, 2)], {
      type: "application/json",
    });
    await deps.upload(metadataPath, metadata, "application/json");
    uploadedPaths.push(metadataPath);
  } catch {
    await Promise.allSettled([deps.remove(uploadedPaths), deps.deleteBase44User(base44UserId)]);
    throw new ApiError(502, "L'envoi des photos a échoué. Aucun profil n'a été créé.", "STORAGE_ERROR");
  }

  deps.onCreated?.();

  return {
    folder,
    name: fields.name,
    avatarUrl: deps.publicUrl(avatarPath),
    imageUrls: imagePaths.map((path) => deps.publicUrl(path)),
    base44UserId,
  };
}
