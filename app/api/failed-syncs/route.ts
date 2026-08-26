import { NextRequest, NextResponse } from "next/server";
import { dlqRepository } from "@/lib/repositories/dlq.repository";
import { syncService } from "@/lib/services/sync.service";
import { errorHandler } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit")) || 50;
    const failures = await dlqRepository.getPendingFailures(limit);
    const logs = await dlqRepository.getRecentLogs(limit);

    return NextResponse.json({
      success: true,
      failures,
      logs,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(_request: NextRequest) {
  try {
    const result = await syncService.retryFailedSyncs();

    return NextResponse.json({
      success: true,
      message: "Exécution des retries terminée",
      ...result,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
