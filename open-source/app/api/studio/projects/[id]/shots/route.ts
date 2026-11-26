import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { createShot } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const shot = await createShot(id, body);
    return NextResponse.json({ success: true, data: shot }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
