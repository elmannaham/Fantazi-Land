import { NextRequest, NextResponse } from "next/server";
import { profilesService } from "@/lib/services/profiles.service";
import { profileCreationService } from "@/lib/services/profile-creation.service";
import { profileQuerySchema, ProfileDescripSchema } from "@/lib/schemas";
import { errorHandler } from "@/lib/errors";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = profileQuerySchema.parse(searchParams);

    const { profiles, total } = await profilesService.getProfiles({
      category: query.category,
      search: query.search,
      sortBy: query.sortBy,
      limit: query.limit,
      offset: query.offset,
    });

    return NextResponse.json({
      success: true,
      data: profiles,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "Email not found in user profile" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validated = ProfileDescripSchema.parse(body);

    // Create profile + Base44 User atomically
    const result = await profileCreationService.createProfile(
      validated,
      user.id,
      user.email
    );

    return NextResponse.json(
      {
        success: true,
        profile: result.profile,
        base44_user_id: result.base44UserId,
        sync_log_id: result.syncLogId,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
