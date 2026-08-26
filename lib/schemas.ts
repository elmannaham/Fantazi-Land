import { z } from "zod";

export const ProfileCategoryEnum = z.enum([
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
]);

export const CurrencyEnum = z.enum(["EUR", "USD", "GBP"]);

export const BookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
]);

// ── Profile Schemas ──────────────────────────────────────────────

export const createProfileSchema = z.object({
  name: z
    .string({ required_error: "Le nom est requis" })
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .max(100, "Le nom ne peut excéder 100 caractères"),
  category: ProfileCategoryEnum,
  bio: z.string().max(2000, "La bio ne peut excéder 2000 caractères").optional().nullable(),
  avatarUrl: z.string().url("URL d'avatar invalide").optional().nullable(),
  baseRate: z
    .number()
    .positive("Le tarif de base doit être supérieur à 0")
    .optional()
    .nullable(),
  currency: CurrencyEnum.default("EUR"),
  instagram: z
    .string()
    .url("Lien Instagram invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  tiktok: z
    .string()
    .url("Lien TikTok invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  twitter: z
    .string()
    .url("Lien Twitter/X invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  website: z
    .string()
    .url("Lien de site web invalide")
    .optional()
    .nullable()
    .or(z.literal("")),
  isPublic: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  availabilityCalendar: z.record(z.string(), z.number()).optional().nullable(),
});

export const updateProfileSchema = createProfileSchema.partial();

const legacyProfileDescriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit comporter au moins 2 caractères").max(100, "Le nom ne peut excéder 100 caractères"),
  categorie: ProfileCategoryEnum,
  bio: z.string().max(2000, "La bio ne peut excéder 2000 caractères").optional().nullable(),
  avatar_url: z.string().url("URL d'avatar invalide").optional().nullable(),
  base_rate: z.coerce.number().positive("Le tarif de base doit être supérieur à 0").optional().nullable(),
  currency: CurrencyEnum.default("EUR"),
  instagram: z.string().url("Lien Instagram invalide").optional().nullable().or(z.literal("")),
  tiktok: z.string().url("Lien TikTok invalide").optional().nullable().or(z.literal("")),
  twitter: z.string().url("Lien Twitter/X invalide").optional().nullable().or(z.literal("")),
  website: z.string().url("Lien de site web invalide").optional().nullable().or(z.literal("")),
  is_public: z.boolean().default(true),
  is_available: z.boolean().default(true),
});

const modernProfileDescriptionSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").max(100, "Le nom ne peut excéder 100 caractères"),
  category: ProfileCategoryEnum,
  bio: z.string().max(2000, "La bio ne peut excéder 2000 caractères").optional().nullable(),
  avatarUrl: z.string().url("URL d'avatar invalide").optional().nullable(),
  baseRate: z.coerce.number().positive("Le tarif de base doit être supérieur à 0").optional().nullable(),
  currency: CurrencyEnum.default("EUR"),
  instagram: z.string().url("Lien Instagram invalide").optional().nullable().or(z.literal("")),
  tiktok: z.string().url("Lien TikTok invalide").optional().nullable().or(z.literal("")),
  twitter: z.string().url("Lien Twitter/X invalide").optional().nullable().or(z.literal("")),
  website: z.string().url("Lien de site web invalide").optional().nullable().or(z.literal("")),
  isPublic: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

export const ProfileDescripSchema = z
  .union([legacyProfileDescriptionSchema, modernProfileDescriptionSchema])
  .transform((data) => {
    if ("nom" in data) {
      return {
        nom: data.nom,
        categorie: data.categorie,
        bio: data.bio ?? "",
        avatar_url: data.avatar_url ?? undefined,
        base_rate: data.base_rate ?? undefined,
        currency: data.currency ?? "EUR",
        instagram: data.instagram ?? undefined,
        tiktok: data.tiktok ?? undefined,
        twitter: data.twitter ?? undefined,
        website: data.website ?? undefined,
        is_public: data.is_public ?? true,
        is_available: data.is_available ?? true,
      };
    }

    return {
      nom: data.name,
      categorie: data.category,
      bio: data.bio ?? "",
      avatar_url: data.avatarUrl ?? undefined,
      base_rate: data.baseRate ?? undefined,
      currency: data.currency ?? "EUR",
      instagram: data.instagram ?? undefined,
      tiktok: data.tiktok ?? undefined,
      twitter: data.twitter ?? undefined,
      website: data.website ?? undefined,
      is_public: data.isPublic ?? true,
      is_available: data.isAvailable ?? true,
    };
  });

export type ProfileDescrip = z.infer<typeof ProfileDescripSchema>;

export const profileQuerySchema = z.object({
  category: ProfileCategoryEnum.optional(),
  search: z.string().optional(),
  sortBy: z.enum(["rating", "newest", "projects"]).default("newest"),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ── CSV Import Row Schema ────────────────────────────────────────

export const csvProfileRowSchema = z.object({
  name: z.string().min(2, "Nom invalide"),
  category: ProfileCategoryEnum,
  bio: z.string().optional().default(""),
  baseRate: z.coerce.number().positive("Tarif invalide").optional(),
  currency: CurrencyEnum.default("EUR"),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
  isAvailable: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1" || val === undefined),
});

// ── Review Schema ────────────────────────────────────────────────

export const createReviewSchema = z.object({
  profileId: z.string().uuid("ID de profil invalide"),
  rating: z.number().int().min(1).max(5, "La note doit être comprise entre 1 et 5"),
  comment: z.string().max(1000, "Le commentaire ne peut excéder 1000 caractères").optional(),
  clientName: z.string().min(2).optional(),
});

// ── Booking Schema ───────────────────────────────────────────────

export const createBookingSchema = z.object({
  profileId: z.string().uuid("ID de profil invalide"),
  projectTitle: z.string().min(3, "Le titre du projet est requis"),
  projectDescription: z.string().max(3000).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive().optional(),
  currency: CurrencyEnum.default("EUR"),
  deliverables: z.array(z.any()).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email("Email client invalide").optional(),
  notes: z.string().optional(),
});
