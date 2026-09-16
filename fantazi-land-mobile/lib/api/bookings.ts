import { apiClient } from './client';
import type { Booking } from '../types';

export interface CreateBookingDto {
  profileId: string;
  projectTitle: string;
  projectDescription?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  clientName?: string;
  clientEmail?: string;
  notes?: string;
}

export async function createBooking(data: CreateBookingDto): Promise<Booking> {
  return apiClient<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchBookings(): Promise<Booking[]> {
  return apiClient<Booking[]>('/api/bookings');
}
