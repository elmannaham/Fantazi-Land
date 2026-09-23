import type { ProfileWithStats } from "@/lib/types";

const DEFAULT_CURRENCY = "CAD";

export interface AgencyStats {
  profileCount: number;
  availableCount: number;
  categoryCount: number;
  /** Lowest hourly rate in the catalogue, or null when it is empty. */
  minRate: number | null;
  /** Currency of the lowest rate. */
  currency: string;
  totalProjects: number;
  totalReviews: number;
  /** Review-weighted average rating, or null when nobody has reviews yet. */
  avgRating: number | null;
  /** Mean response time over profiles that report one, or null. */
  avgResponseHours: number | null;
}

/**
 * Aggregates the public catalogue into agency-level figures.
 * Values that have no real data behind them (no reviews, no response time)
 * come back as null so the UI can hide them instead of showing defaults.
 */
export function computeAgencyStats(profiles: readonly ProfileWithStats[]): AgencyStats {
  const categories = new Set(
    profiles.map((p) => p.category?.trim().toLowerCase()).filter((c): c is string => Boolean(c))
  );

  const cheapest = profiles.reduce<ProfileWithStats | null>(
    (min, p) => (min === null || Number(p.base_rate) < Number(min.base_rate) ? p : min),
    null
  );

  const totalProjects = profiles.reduce((sum, p) => sum + (p.performance_stats?.total_projects ?? 0), 0);
  const totalReviews = profiles.reduce((sum, p) => sum + (p.performance_stats?.total_reviews ?? 0), 0);
  const weightedRating = profiles.reduce(
    (sum, p) => sum + (p.performance_stats?.avg_rating ?? 0) * (p.performance_stats?.total_reviews ?? 0),
    0
  );

  const responseTimes = profiles
    .map((p) => p.performance_stats?.response_time_hours)
    .filter((h): h is number => typeof h === "number");

  return {
    profileCount: profiles.length,
    availableCount: profiles.filter((p) => p.is_available !== false).length,
    categoryCount: categories.size,
    minRate: cheapest ? Number(cheapest.base_rate) : null,
    currency: cheapest?.currency || DEFAULT_CURRENCY,
    totalProjects,
    totalReviews,
    avgRating: totalReviews > 0 ? weightedRating / totalReviews : null,
    avgResponseHours:
      responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null,
  };
}
