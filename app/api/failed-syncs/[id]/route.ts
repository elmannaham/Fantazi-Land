import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorHandler } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.failedSync.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}

// Manual retry endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.failedSync.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Reset to pending for immediate retry
    const updated = await prisma.failedSync.update({
      where: { id },
      data: {
        status: "pending",
        retry_count: 0,
        last_attempted_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return errorHandler(error);
  }
}
