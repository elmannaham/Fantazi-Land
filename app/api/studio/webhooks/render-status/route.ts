import { NextRequest, NextResponse } from "next/server";
import type { RenderStatus } from "@prisma/client";
import { errorHandler, unauthorizedError, validationError } from "@/lib/errors";
import { setRenderStatus } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, RenderStatus> = {
  draft: "DRAFT",
  brouillon: "DRAFT",
  queued: "QUEUED",
  en_file: "QUEUED",
  rendered: "RENDERED",
  rendu: "RENDERED",
  review: "REVIEW",
  a_revoir: "REVIEW",
};

/**
 * Extension point: an external generation / swap / edit engine can push the
 * status of a shot back into the studio. Works out of the box in draft mode;
 * set STUDIO_WEBHOOK_SECRET to require the x-webhook-secret header.
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.STUDIO_WEBHOOK_SECRET;
    if (secret && request.headers.get("x-webhook-secret") !== secret) {
      throw unauthorizedError("Signature webhook invalide");
    }

    const body = await request.json();
    const shotId = typeof body.shot_id === "string" ? body.shot_id : null;
    if (!shotId) throw validationError("Le champ 'shot_id' est requis");

    const status = STATUS_MAP[String(body.status ?? "").toLowerCase()];
    if (!status) {
      throw validationError("Statut inconnu — valeurs acceptées : queued, rendered, review, draft");
    }

    const shot = await setRenderStatus(
      shotId,
      status,
      typeof body.notes === "string" ? body.notes : null
    );

    return NextResponse.json({ success: true, data: shot });
  } catch (error) {
    return errorHandler(error);
  }
}
