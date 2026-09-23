import { NextRequest, NextResponse } from "next/server";
import { bookingsService } from "@/lib/services/bookings.service";
import { BookingStatusEnum } from "@/lib/schemas";
import { errorHandler, validationError } from "@/lib/errors";
import { requireProfileAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const booking = await bookingsService.getBookingById(id);
    await requireProfileAccess(request, booking.profile_id);
    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const booking = await bookingsService.getBookingById(id);
    await requireProfileAccess(request, booking.profile_id);
    const body = await request.json();
    const parsedStatus = BookingStatusEnum.safeParse(body.status);

    if (!parsedStatus.success) {
      throw validationError(
        `Statut invalide. Valeurs acceptées: ${BookingStatusEnum.options.join(", ")}`
      );
    }

    const updated = await bookingsService.updateBookingStatus(id, parsedStatus.data);

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
