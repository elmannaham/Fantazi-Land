import type { ExportPreset, Project, SceneShot } from "@prisma/client";
import { FORMAT_SPECS, SHOT_TYPE_META, SWAP_TYPE_META } from "./constants";
import type { ProductionPlan } from "./types";

export function activeShots(shots: SceneShot[]): SceneShot[] {
  return shots.filter((shot) => shot.is_active);
}

export function totalDuration(shots: SceneShot[]): number {
  return activeShots(shots).reduce((total, shot) => total + shot.duration_seconds, 0);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  return `${minutes} min ${String(rest).padStart(2, "0")} s`;
}

export function formatTimecode(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export type QualityCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export function qualityChecklist(shots: SceneShot[]): QualityCheck[] {
  const active = activeShots(shots);

  const needingPrompt = active.filter(
    (shot) => shot.shot_type === "GENERATION" || shot.shot_type === "SWAP"
  );
  const missingPrompt = needingPrompt.filter((shot) => !shot.visual_prompt?.trim());

  const missingSubtitles = active.filter((shot) => !shot.subtitle_text?.trim());
  const missingAudio = active.filter((shot) => !shot.audio_track?.trim());

  const swapShots = active.filter((shot) => Boolean(shot.swap_type));
  const invalidSwap = swapShots.filter(
    (shot) =>
      !shot.swap_consent_confirmed ||
      !shot.swap_source_ref?.trim() ||
      !shot.swap_target_ref?.trim()
  );

  return [
    {
      key: "visual_consistency",
      label: "Cohérence visuelle",
      ok: active.length > 0 && missingPrompt.length === 0,
      detail:
        active.length === 0
          ? "Aucun plan actif dans le projet"
          : missingPrompt.length === 0
            ? "Tous les plans générés ou swappés ont un prompt visuel"
            : `${missingPrompt.length} plan(s) sans prompt visuel`,
    },
    {
      key: "subtitle_readability",
      label: "Lisibilité sous-titres",
      ok: active.length > 0 && missingSubtitles.length === 0,
      detail:
        missingSubtitles.length === 0
          ? "Sous-titres renseignés sur tous les plans actifs"
          : `${missingSubtitles.length} plan(s) sans texte / sous-titre`,
    },
    {
      key: "audio_balance",
      label: "Équilibre audio",
      ok: active.length > 0 && missingAudio.length === 0,
      detail:
        missingAudio.length === 0
          ? "Piste audio définie sur tous les plans actifs"
          : `${missingAudio.length} plan(s) sans piste audio ou SFX`,
    },
    {
      key: "swap_compliance",
      label: "Conformité swap",
      ok: invalidSwap.length === 0,
      detail:
        swapShots.length === 0
          ? "Aucune opération de swap sur ce projet"
          : invalidSwap.length === 0
            ? `${swapShots.length} swap(s) avec consentement et références`
            : `${invalidSwap.length} swap(s) sans consentement ou référence complète`,
    },
  ];
}

export function buildProductionPlan(
  project: Project,
  shots: SceneShot[],
  preset: ExportPreset | null
): ProductionPlan {
  const active = activeShots(shots);
  const spec = FORMAT_SPECS[project.format];
  const duration = totalDuration(shots);
  const quality = qualityChecklist(shots);
  let cursor = 0;

  return {
    schema: "videoflow.production_plan/v1",
    generated_at: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      brief: project.brief,
      format: spec.label,
      orientation: spec.orientation.toLowerCase(),
      resolution: `${spec.width}x${spec.height}`,
      fps: project.fps,
      status: project.status.toLowerCase(),
      shot_count: active.length,
      total_duration_seconds: duration,
      total_duration_human: formatDuration(duration),
      engine_webhook_url: project.engine_webhook_url ?? null,
    },
    export: preset
      ? {
          preset: preset.name,
          platform: preset.platform,
          format: preset.format === "VERTICAL_9_16" ? "9:16" : "16:9",
          resolution: preset.resolution,
          fps: preset.fps,
          container: preset.container,
          video_bitrate_mbps: preset.video_bitrate_mbps,
          audio_bitrate_kbps: preset.audio_bitrate_kbps,
          burned_subtitles: preset.burned_subtitles,
        }
      : {
          preset: null,
          resolution: `${spec.width}x${spec.height}`,
          fps: project.fps,
          container: "mp4",
        },
    quality,
    shots: active.map((shot, index) => {
      const start = cursor;
      cursor += shot.duration_seconds;
      return {
        index: index + 1,
        id: shot.id,
        title: shot.title,
        type: SHOT_TYPE_META[shot.shot_type].label,
        type_key: shot.shot_type.toLowerCase(),
        duration_seconds: shot.duration_seconds,
        timeline: `${formatTimecode(start)} → ${formatTimecode(cursor)}`,
        active: shot.is_active,
        render_status: shot.render_status.toLowerCase(),
        render_notes: shot.render_notes,
        script: {
          voiceover: shot.voiceover,
          action: shot.action,
          hook: shot.hook,
        },
        generation: {
          visual_prompt: shot.visual_prompt,
          consistency_notes: shot.consistency_notes,
          thumbnail_url: shot.thumbnail_url,
        },
        swap: shot.swap_type
          ? {
              type: SWAP_TYPE_META[shot.swap_type].label,
              type_key: shot.swap_type.toLowerCase(),
              source_reference: shot.swap_source_ref,
              target_reference: shot.swap_target_ref,
              preserve_zones: shot.swap_preserve_zones,
              consent_confirmed: shot.swap_consent_confirmed,
            }
          : null,
        edit: {
          transition_in: shot.transition_in,
          transition_out: shot.transition_out,
          pacing: shot.pacing,
          subtitle_text: shot.subtitle_text,
          audio_track: shot.audio_track,
        },
      };
    }),
  };
}

export function buildProductionSummary(plan: ProductionPlan): string {
  const project = plan.project as {
    title: string;
    format: string;
    resolution: string;
    fps: number;
    total_duration_human: string;
    shot_count: number;
  };
  const shots = plan.shots as {
    index: number;
    title: string;
    type: string;
    duration_seconds: number;
    timeline: string;
    render_status: string;
    edit: { subtitle_text: string | null };
  }[];
  const lines = [
    `# ${project.title} — plan de production`,
    `${project.format} · ${project.resolution} · ${project.fps} fps · ${project.total_duration_human} · ${project.shot_count} plans`,
    "",
    ...shots.map(
      (shot) =>
        `${shot.index}. [${shot.timeline}] ${shot.title} — ${shot.type}, ${shot.duration_seconds}s (${shot.render_status})${shot.edit.subtitle_text ? ` · « ${shot.edit.subtitle_text} »` : ""}`
    ),
  ];
  return lines.join("\n");
}
