import { NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { listExportPresets } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const presets = await listExportPresets();
    return NextResponse.json({ success: true, data: presets });
  } catch (error) {
    return errorHandler(error);
  }
}
