import { bookingsRepository } from "@/lib/repositories/bookings.repository";
import { profilesRepository } from "@/lib/repositories/profiles.repository";
import { createServiceClient } from "@/lib/supabase";
import { createBookingSchema } from "@/lib/schemas";
import { notFoundError } from "@/lib/errors";
import type { Booking, BookingStatus } from "@/lib/types";

export class BookingsService {
  private adminClient = createServiceClient();

  /**
   * Récupère les réservations associées à un profil
   */
  async getBookingsByProfile(profileId: string): Promise<Booking[]> {
    return bookingsRepository.findByProfileId(profileId);
  }

  /**
   * Récupère une réservation par son ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const booking = await bookingsRepository.findById(id);
    if (!booking) {
      throw notFoundError(`Réservation introuvable [${id}]`);
    }
    return booking;
  }

  /**
   * Crée une nouvelle réservation de projet pour une créatrice
   */
  async createBooking(data: unknown, clientId?: string): Promise<Booking> {
    const validated = createBookingSchema.parse(data);

    const profile = await profilesRepository.findById(validated.profileId);
    if (!profile) {
      throw notFoundError("Le profil de la créatrice est introuvable");
    }

    const booking = await bookingsRepository.create({
      profile_id: validated.profileId,
      client_id: clientId || null,
      client_name: validated.clientName || null,
      client_email: validated.clientEmail || null,
      project_title: validated.projectTitle,
      project_description: validated.projectDescription || null,
      start_date: validated.startDate || null,
      end_date: validated.endDate || null,
      budget: validated.budget || profile.base_rate || null,
      currency: validated.currency || profile.currency || "EUR",
      deliverables: validated.deliverables || null,
      notes: validated.notes || null,
      status: "pending",
    });

    return booking;
  }

  /**
   * Met à jour le statut d'une réservation (ex: pending -> confirmed -> completed)
   */
  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const existing = await this.getBookingById(id);
    const updated = await bookingsRepository.updateStatus(id, status);

    // Si le projet est terminé, incrémenter le total de projets de la créatrice
    if (status === "completed" && existing.status !== "completed") {
      const { data: stats } = await this.adminClient
        .from("performance_stats")
        .select("total_projects")
        .eq("profile_id", updated.profile_id)
        .maybeSingle();

      const newTotal = (stats?.total_projects || 0) + 1;

      await this.adminClient
        .from("performance_stats")
        .upsert(
          {
            profile_id: updated.profile_id,
            total_projects: newTotal,
            last_project_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );
    }

    return updated;
  }
}

export const bookingsService = new BookingsService();
