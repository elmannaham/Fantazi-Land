import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorHandler } from "@/lib/errors";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.failedSync.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorHandler(error);
  }
}

// Manual retry endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.failedSync.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Reset to pending for immediate retry
    const updated = await prisma.failedSync.update({
      where: { id: params.id },
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
