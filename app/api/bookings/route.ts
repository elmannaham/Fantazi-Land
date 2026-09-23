import { NextRequest, NextResponse } from "next/server";
import { bookingsService } from "@/lib/services/bookings.service";
import { errorHandler, validationError } from "@/lib/errors";
import { requireProfileAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId");

    if (!profileId) {
      throw validationError("Le paramètre 'profileId' est requis");
    }

    // Les réservations contiennent les coordonnées des clients : propriétaire du profil ou admin uniquement
    await requireProfileAccess(request, profileId);
    const bookings = await bookingsService.getBookingsByProfile(profileId);

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const booking = await bookingsService.createBooking(body);

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
