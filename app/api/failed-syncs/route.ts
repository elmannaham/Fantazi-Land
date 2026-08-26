import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorHandler } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status") || "pending";
    
    const items = await prisma.failedSync.findMany({
      where: { status: status as any },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
