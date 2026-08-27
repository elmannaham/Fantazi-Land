import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { profilesRepository } from "@/lib/repositories/profiles.repository";
import { errorHandler } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    let profile = null;

    if (user.role === "creator") {
      profile = await profilesRepository.findByUserId(user.id);
    }

    return NextResponse.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
