import { NextRequest, NextResponse } from "next/server";
import { syncService } from "@/lib/services/sync.service";
import { requireRole } from "@/lib/auth";
import { errorHandler } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const profiles = await syncService.getCachedSyncedProfiles();
    return NextResponse.json({
      success: true,
      cachedProfilesCount: profiles.length,
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        avatar: p.avatar_url,
        mediaCount: p.media_assets?.length || 0,
        syncedAt: p.synced_at,
      })),
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const body = await request.json().catch(() => ({}));
    const bucketName = body.bucketName || "HOTESS";

    const syncResult = await syncService.syncAllFromBucket(bucketName);

    return NextResponse.json({
      success: syncResult.success,
      data: syncResult,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
