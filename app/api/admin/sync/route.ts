import { NextRequest, NextResponse } from "next/server";
import { syncService } from "@/lib/services/sync.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const bucketName = body.bucketName || "HOTESS";

    const syncResult = await syncService.syncAllFromBucket(bucketName);

    return NextResponse.json({
      success: syncResult.success,
      data: syncResult,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
