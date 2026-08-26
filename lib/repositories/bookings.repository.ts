import { supabase, createServiceClient } from "@/lib/supabase";
import type { Booking, BookingStatus } from "@/lib/types";

export class BookingsRepository {
  private client = supabase;
  private adminClient = createServiceClient();

  async findByProfileId(profileId: string): Promise<Booking[]> {
    const { data, error } = await this.client
      .from("bookings")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Erreur récupération bookings: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Erreur booking [${id}]: ${error.message}`);
    return data;
  }

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    const { data, error } = await this.client
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (error) throw new Error(`Erreur création booking: ${error.message}`);
    return data;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const updates: Partial<Booking> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.adminClient
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour statut booking [${id}]: ${error.message}`);
    return data;
  }
}

export const bookingsRepository = new BookingsRepository();
