import { apiClient } from './client';
import type { Review } from '../types';

export async function fetchReviews(profileId: string): Promise<Review[]> {
  return apiClient<Review[]>(`/api/reviews?profileId=${profileId}`);
}
