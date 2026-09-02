import { z } from "zod";
import type { ProfileCategory, BookingStatus } from "./types";

// Profile-related schemas
export const ProfileCategorySchema = z.enum([
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
] as const satisfies readonly ProfileCategory[]);

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  name: z.string().min(1),
  category: ProfileCategorySchema,
  bio: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  base_rate: z.number().positive().nullable(),
  currency: z.string().default("EUR"),
  instagram_url: z.string().url().nullable(),
  tiktok_url: z.string().url().nullable(),
  twitter_url: z.string().url().nullable(),
  website_url: z.string().url().nullable(),
  is_public: z.boolean().default(true),
  is_available: z.boolean().default(true),
  availability_calendar: z.record(z.number()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  synced_at: z.string().datetime().nullable(),
  storage_folder_id: z.string().nullable(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

// Performance stats schema
export const PerformanceStatsSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  total_projects: z.number().int().nonnegative(),
  total_reviews: z.number().int().nonnegative(),
  avg_rating: z.number().min(0).max(5),
  response_time_hours: z.number().positive().nullable(),
  completion_rate: z.number().min(0).max(1),
  repeat_client_rate: z.number().min(0).max(1),
  last_project_date: z.string().datetime().nullable(),
  updated_at: z.string().datetime(),
});

export type PerformanceStatsInput = z.infer<typeof PerformanceStatsSchema>;

// Media asset schema
export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  file_url: z.string().url(),
  file_type: z.enum(["image", "video", "document"]),
  file_size_bytes: z.number().positive().nullable(),
  uploaded_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

export type MediaAssetInput = z.infer<typeof MediaAssetSchema>;

// Review schema
export const ReviewSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  client_name: z.string().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

// Booking schema
export const BookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const satisfies readonly BookingStatus[]);

export const BookingSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  client_id: z.string().uuid().nullable(),
  client_name: z.string().nullable(),
  client_email: z.string().email().nullable(),
  project_title: z.string().min(1),
  project_description: z.string().nullable(),
  status: BookingStatusSchema,
  start_date: z.string().datetime().nullable(),
  end_date: z.string().datetime().nullable(),
  budget: z.number().positive().nullable(),
  currency: z.string().default("EUR"),
  deliverables: z.array(z.any()).nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// Profile with stats (extended)
export const ProfileWithStatsSchema = ProfileSchema.extend({
  performance_stats: PerformanceStatsSchema.nullable(),
  reviews: ReviewSchema.array().optional(),
  media_assets: MediaAssetSchema.array().optional(),
});

export type ProfileWithStats = z.infer<typeof ProfileWithStatsSchema>;

// API response envelope
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  meta: z.object({
    total: z.number().int().nonnegative().optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }).optional(),
});

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};
