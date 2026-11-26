import { NextRequest, NextResponse } from "next/server";
import { errorHandler, validationError } from "@/lib/errors";
import { buildProductionPlan, buildProductionSummary } from "@/lib/studio/plan";
import { dispatchToEngine, getProject } from "@/lib/studio/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const project = await getProject(id);

    if (project.shots.length === 0) {
      throw validationError("Ajoutez au moins un plan avant d'exporter le projet");
    }

    const plan = buildProductionPlan(project, project.shots, project.export_preset);
    const summary = buildProductionSummary(plan);

    let dispatch: { attempted: boolean; ok?: boolean; status?: number; message: string } = {
      attempted: false,
      message: "Aucun moteur externe configuré — plan exporté en mode brouillon",
    };

    if (body.dispatch) {
      if (!project.engine_webhook_url) {
        dispatch = {
          attempted: false,
          message: "Renseignez l'URL du moteur externe pour l'envoi automatique",
        };
      } else {
        try {
          const result = await dispatchToEngine(project.engine_webhook_url, plan);
          dispatch = {
            attempted: true,
            ok: result.ok,
            status: result.status,
            message: result.ok
              ? "Plan transmis au moteur externe"
              : `Le moteur a répondu ${result.status}`,
          };
        } catch (error) {
          dispatch = {
            attempted: true,
            ok: false,
            message:
              error instanceof Error
                ? `Envoi impossible : ${error.message}`
                : "Envoi impossible",
          };
        }
      }
    }

    return NextResponse.json({ success: true, data: { plan, summary, dispatch } });
  } catch (error) {
    return errorHandler(error);
  }
}
