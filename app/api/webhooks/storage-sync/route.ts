import { NextRequest, NextResponse } from "next/server";
import { syncService } from "@/lib/services/sync.service";
import { errorHandler, validationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const folderName = payload?.record?.name || payload?.name;

    if (!folderName) {
      throw validationError("Nom de dossier manquant dans le payload webhook");
    }

    const profile = await syncService.syncStorageToDb(folderName);

    return NextResponse.json({
      success: true,
      action: "synced",
      profileId: profile.id,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
