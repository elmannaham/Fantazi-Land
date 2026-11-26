import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "@/lib/errors";
import { deleteShot, updateShot } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const shot = await updateShot(id, body);
    return NextResponse.json({ success: true, data: shot });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteShot(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return errorHandler(error);
  }
}
