import { NextRequest, NextResponse } from "next/server";
import { profilesService } from "@/lib/services/profiles.service";
import { errorHandler } from "@/lib/errors";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const includeMedia = request.nextUrl.searchParams.get("includeMedia") !== "false";
    const includeReviews = request.nextUrl.searchParams.get("includeReviews") !== "false";
    const reviewLimit = Number(request.nextUrl.searchParams.get("reviewLimit")) || 5;

    const profile = await profilesService.getProfileById(id, {
      includeMedia,
      includeReviews,
      reviewLimit,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await profilesService.updateProfile(id, body);

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    await profilesService.deleteProfile(id);

    return NextResponse.json({
      success: true,
      message: "Profil supprimé avec succès",
    });
  } catch (error) {
    return errorHandler(error);
  }
}
