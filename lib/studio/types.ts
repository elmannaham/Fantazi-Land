import type {
  ExportPreset,
  Project,
  RenderStatus,
  SceneShot,
  ShotType,
  SwapType,
} from "@prisma/client";

export type ShotSummary = Pick<
  SceneShot,
  | "id"
  | "position"
  | "title"
  | "shot_type"
  | "duration_seconds"
  | "is_active"
  | "render_status"
  | "thumbnail_url"
  | "swap_type"
>;

export type ProjectSummary = Project & {
  shots: ShotSummary[];
  total_duration_seconds: number;
  export_preset: ExportPreset | null;
};

export type ProjectDetail = Project & {
  shots: SceneShot[];
  total_duration_seconds: number;
  export_preset: ExportPreset | null;
};

export type ProductionPlan = {
  schema: string;
  generated_at: string;
  project: Record<string, unknown>;
  export: Record<string, unknown>;
  quality: { key: string; label: string; ok: boolean; detail: string }[];
  shots: Record<string, unknown>[];
};

export type StudioToast = { kind: "success" | "error"; message: string } | null;

/** Editable form state of a shot (empty string = field left blank). */
export type ShotDraft = {
  title: string;
  shot_type: ShotType;
  duration_seconds: number;
  is_active: boolean;
  voiceover: string;
  action: string;
  hook: string;
  visual_prompt: string;
  consistency_notes: string;
  swap_type: SwapType | "";
  swap_source_ref: string;
  swap_target_ref: string;
  swap_preserve_zones: string;
  swap_consent_confirmed: boolean;
  transition_in: string;
  transition_out: string;
  pacing: string;
  subtitle_text: string;
  audio_track: string;
  render_status: RenderStatus;
  render_notes: string;
};

export function shotToDraft(shot: SceneShot): ShotDraft {
  return {
    title: shot.title,
    shot_type: shot.shot_type,
    duration_seconds: shot.duration_seconds,
    is_active: shot.is_active,
    voiceover: shot.voiceover ?? "",
    action: shot.action ?? "",
    hook: shot.hook ?? "",
    visual_prompt: shot.visual_prompt ?? "",
    consistency_notes: shot.consistency_notes ?? "",
    swap_type: shot.swap_type ?? "",
    swap_source_ref: shot.swap_source_ref ?? "",
    swap_target_ref: shot.swap_target_ref ?? "",
    swap_preserve_zones: shot.swap_preserve_zones ?? "",
    swap_consent_confirmed: shot.swap_consent_confirmed,
    transition_in: shot.transition_in ?? "",
    transition_out: shot.transition_out ?? "",
    pacing: shot.pacing ?? "",
    subtitle_text: shot.subtitle_text ?? "",
    audio_track: shot.audio_track ?? "",
    render_status: shot.render_status,
    render_notes: shot.render_notes ?? "",
  };
}
