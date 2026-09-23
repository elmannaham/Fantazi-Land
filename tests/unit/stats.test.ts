import { describe, expect, test } from "vitest";
import { computeAgencyStats } from "@/lib/stats";
import type { PerformanceStats, ProfileWithStats } from "@/lib/types";

function makeProfile(
  overrides: Partial<ProfileWithStats>,
  stats: Partial<PerformanceStats> | null = {}
): ProfileWithStats {
  return {
    id: overrides.id ?? "p1",
    name: "Test",
    category: "Dinner & Show",
    base_rate: 500,
    currency: "CAD",
    is_available: true,
    ...overrides,
    performance_stats:
      stats === null
        ? null
        : {
            id: "s1",
            profile_id: overrides.id ?? "p1",
            total_projects: 0,
            total_reviews: 0,
            avg_rating: 5,
            response_time_hours: null,
            completion_rate: 100,
            repeat_client_rate: 0,
            last_project_date: null,
            updated_at: "2026-09-23T00:00:00Z",
            ...stats,
          },
  } as ProfileWithStats;
}

describe("computeAgencyStats", () => {
  test("returns empty stats for an empty catalogue", () => {
    const stats = computeAgencyStats([]);

    expect(stats).toEqual({
      profileCount: 0,
      availableCount: 0,
      categoryCount: 0,
      minRate: null,
      currency: "CAD",
      totalProjects: 0,
      totalReviews: 0,
      avgRating: null,
      avgResponseHours: null,
    });
  });

  test("counts profiles, availability and distinct categories", () => {
    const stats = computeAgencyStats([
      makeProfile({ id: "a", category: "intime rencontre" }),
      makeProfile({ id: "b", category: "intime rencontre", is_available: false }),
      makeProfile({ id: "c", category: "Dinner & Show" }),
    ]);

    expect(stats.profileCount).toBe(3);
    expect(stats.availableCount).toBe(2);
    expect(stats.categoryCount).toBe(2);
  });

  test("hides the rating when there are no reviews, even if avg_rating has a default", () => {
    const stats = computeAgencyStats([makeProfile({ id: "a" }, { avg_rating: 5, total_reviews: 0 })]);

    expect(stats.totalReviews).toBe(0);
    expect(stats.avgRating).toBeNull();
  });

  test("weights the average rating by review count", () => {
    const stats = computeAgencyStats([
      makeProfile({ id: "a" }, { avg_rating: 5, total_reviews: 3 }),
      makeProfile({ id: "b" }, { avg_rating: 4, total_reviews: 1 }),
      makeProfile({ id: "c" }, { avg_rating: 5, total_reviews: 0 }),
    ]);

    expect(stats.totalReviews).toBe(4);
    expect(stats.avgRating).toBeCloseTo(4.75);
  });

  test("sums projects and returns the lowest rate with its currency", () => {
    const stats = computeAgencyStats([
      makeProfile({ id: "a", base_rate: 1500, currency: "CAD" }, { total_projects: 2 }),
      makeProfile({ id: "b", base_rate: 500, currency: "EUR" }, { total_projects: 1 }),
    ]);

    expect(stats.totalProjects).toBe(3);
    expect(stats.minRate).toBe(500);
    expect(stats.currency).toBe("EUR");
  });

  test("averages response time only over profiles that report one", () => {
    const stats = computeAgencyStats([
      makeProfile({ id: "a" }, { response_time_hours: 2 }),
      makeProfile({ id: "b" }, { response_time_hours: 6 }),
      makeProfile({ id: "c" }, { response_time_hours: null }),
      makeProfile({ id: "d" }, null),
    ]);

    expect(stats.avgResponseHours).toBe(4);
  });
});
