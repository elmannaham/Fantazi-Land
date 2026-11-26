import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { reorderShots } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const project = await reorderShots(id, body.order);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return errorHandler(error);
  }
}
