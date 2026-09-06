export interface Profile {
  id: string;
  user_id: string | null;
  name: string;
  category: ProfileCategory;
  bio: string | null;
  avatar_url: string | null;
  base_rate: number | null;
  currency: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  is_public: boolean;
  is_available: boolean;
  availability_calendar: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  storage_folder_id: string | null;
}

export type ProfileCategory =
  | "Photographie"
  | "Vidéographie"
  | "Contenu Mode"
  | "Beauté"
  | "Lifestyle"
  | "Gaming";

export interface PerformanceStats {
  id: string;
  profile_id: string;
  total_projects: number;
  total_reviews: number;
  avg_rating: number;
  response_time_hours: number | null;
  completion_rate: number;
  repeat_client_rate: number;
  last_project_date: string | null;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  profile_id: string;
  file_url: string;
  file_type: "image" | "video" | "document";
  file_size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  profile_id: string;
  client_id: string | null;
  client_name: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  profile_id: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  project_title: string;
  project_description: string | null;
  status: BookingStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string;
  deliverables: any[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type UserRole = "client" | "creator" | "admin";

export interface ProfileWithStats extends Profile {
  performance_stats: PerformanceStats | null;
  reviews?: Review[];
  media_assets?: MediaAsset[];
}
