import { NextRequest, NextResponse } from "next/server";
import { reviewsService } from "@/lib/services/reviews.service";
import { errorHandler, validationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId");
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

    if (!profileId) {
      throw validationError("Le paramètre 'profileId' est requis");
    }

    const reviews = await reviewsService.getReviewsByProfile(profileId, limit);

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const review = await reviewsService.createReview(body);

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
