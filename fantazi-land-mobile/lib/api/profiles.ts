import { apiClient } from './client';
import type { ProfileWithStats, ProfileCategory } from '../types';

export interface CreateProfileDto {
  name: string;
  category: ProfileCategory;
  bio?: string | null;
  avatarUrl?: string | null;
  baseRate?: number | null;
  currency?: string;
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  website?: string | null;
  isPublic?: boolean;
  isAvailable?: boolean;
}

export async function fetchProfiles(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ProfileWithStats[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'Tous') {
    query.set('category', params.category);
  }
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const qs = query.toString();
  return apiClient<ProfileWithStats[]>(`/api/profiles${qs ? `?${qs}` : ''}`);
}

export async function fetchProfileById(id: string): Promise<ProfileWithStats> {
  return apiClient<ProfileWithStats>(`/api/profiles/${id}?include=media_assets`);
}

export async function createProfile(data: CreateProfileDto): Promise<ProfileWithStats> {
  return apiClient<ProfileWithStats>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

