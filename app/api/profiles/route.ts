import { NextRequest, NextResponse } from "next/server";
import { profilesService } from "@/lib/services/profiles.service";
import { profileQuerySchema } from "@/lib/schemas";
import { errorHandler } from "@/lib/errors";

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
    const body = await request.json();
    const profile = await profilesService.createProfile(body);

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error);
  }
}
