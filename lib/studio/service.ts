import type {
  Prisma,
  ProjectStatus,
  RenderStatus,
  ShotType,
  SwapType,
  VideoFormat,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFoundError, validationError } from "@/lib/errors";
import {
  FPS_OPTIONS,
  FORMAT_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  RENDER_STATUS_OPTIONS,
  SHOT_TYPE_OPTIONS,
  SWAP_TYPE_OPTIONS,
} from "./constants";
import { totalDuration } from "./plan";
import type { ProjectDetail, ProjectSummary } from "./types";

const SHOT_TEXT_FIELDS = [
  "title",
  "thumbnail_url",
  "voiceover",
  "action",
  "hook",
  "visual_prompt",
  "consistency_notes",
  "swap_source_ref",
  "swap_target_ref",
  "swap_preserve_zones",
  "transition_in",
  "transition_out",
  "pacing",
  "subtitle_text",
  "audio_track",
  "render_notes",
] as const;

const PROJECT_SHOT_SELECT = {
  id: true,
  position: true,
  title: true,
  shot_type: true,
  duration_seconds: true,
  is_active: true,
  render_status: true,
  thumbnail_url: true,
  swap_type: true,
} satisfies Prisma.SceneShotSelect;

const DEFAULT_PRESETS = [
  {
    name: "Reels & Shorts",
    platform: "Instagram / TikTok",
    format: "VERTICAL_9_16" as VideoFormat,
    resolution: "1080x1920",
    fps: 30,
    container: "mp4",
    video_bitrate_mbps: 12,
    audio_bitrate_kbps: 192,
    burned_subtitles: true,
    is_default: true,
  },
  {
    name: "YouTube HD",
    platform: "YouTube",
    format: "HORIZONTAL_16_9" as VideoFormat,
    resolution: "1920x1080",
    fps: 30,
    container: "mp4",
    video_bitrate_mbps: 16,
    audio_bitrate_kbps: 320,
    burned_subtitles: false,
    is_default: false,
  },
  {
    name: "Master vertical 4K",
    platform: "Archive / étalonnage",
    format: "VERTICAL_9_16" as VideoFormat,
    resolution: "2160x3840",
    fps: 30,
    container: "mov",
    video_bitrate_mbps: 60,
    audio_bitrate_kbps: 320,
    burned_subtitles: false,
    is_default: false,
  },
];

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw validationError(`Valeur invalide pour « ${field} »`);
  }
  return value as T;
}

function normalizeDuration(value: unknown, fallback = 5): number {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw validationError("Durée invalide");
  return Math.min(600, Math.max(1, Math.round(parsed)));
}

function normalizeUrl(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("protocol");
    }
    return url.toString();
  } catch {
    throw validationError("L'URL du webhook doit commencer par http:// ou https://");
  }
}

export async function ensureDefaultPresets() {
  const count = await prisma.exportPreset.count();
  if (count > 0) return;
  await prisma.exportPreset.createMany({ data: DEFAULT_PRESETS });
}

export async function listExportPresets() {
  await ensureDefaultPresets();
  return prisma.exportPreset.findMany({ orderBy: [{ is_default: "desc" }, { name: "asc" }] });
}

export async function listProjects(): Promise<ProjectSummary[]> {
  await ensureDefaultPresets();
  const projects = await prisma.project.findMany({
    orderBy: { updated_at: "desc" },
    include: {
      export_preset: true,
      shots: { select: PROJECT_SHOT_SELECT, orderBy: { position: "asc" } },
    },
  });

  return projects.map((project) => ({
    ...project,
    total_duration_seconds: project.shots
      .filter((shot) => shot.is_active)
      .reduce((total, shot) => total + shot.duration_seconds, 0),
  }));
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      export_preset: true,
      shots: { orderBy: { position: "asc" } },
    },
  });

  if (!project) throw notFoundError("Projet introuvable");

  return { ...project, total_duration_seconds: totalDuration(project.shots) };
}

export async function createProject(body: Record<string, unknown>) {
  await ensureDefaultPresets();

  const title = normalizeText(body.title);
  if (!title) throw validationError("Le titre du projet est requis");

  const defaultPreset = await prisma.exportPreset.findFirst({
    where: { is_default: true },
    orderBy: { created_at: "asc" },
  });

  const project = await prisma.project.create({
    data: {
      title,
      brief: normalizeText(body.brief),
      format: pickEnum<VideoFormat>(body.format, FORMAT_OPTIONS, "format") ?? "VERTICAL_9_16",
      fps: FPS_OPTIONS.includes(Number(body.fps)) ? Number(body.fps) : 30,
      status:
        pickEnum<ProjectStatus>(body.status, PROJECT_STATUS_OPTIONS, "status") ?? "DRAFT",
      engine_webhook_url: normalizeUrl(body.engine_webhook_url),
      export_preset_id: defaultPreset?.id ?? null,
    },
    include: { export_preset: true, shots: true },
  });

  return { ...project, total_duration_seconds: 0 };
}

export async function updateProject(id: string, body: Record<string, unknown>) {
  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw notFoundError("Projet introuvable");

  const data: Prisma.ProjectUpdateInput = {};

  if (body.title !== undefined) {
    const title = normalizeText(body.title);
    if (!title) throw validationError("Le titre du projet est requis");
    data.title = title;
  }
  if (body.brief !== undefined) data.brief = normalizeText(body.brief);

  const format = pickEnum<VideoFormat>(body.format, FORMAT_OPTIONS, "format");
  if (format) data.format = format;

  if (body.fps !== undefined) {
    const fps = Number(body.fps);
    if (!FPS_OPTIONS.includes(fps)) throw validationError("Cadence non supportée");
    data.fps = fps;
  }

  const status = pickEnum<ProjectStatus>(body.status, PROJECT_STATUS_OPTIONS, "status");
  if (status) data.status = status;

  if (body.engine_webhook_url !== undefined) {
    data.engine_webhook_url = normalizeUrl(body.engine_webhook_url);
  }

  if (body.export_preset_id !== undefined) {
    const presetId = normalizeText(body.export_preset_id);
    if (presetId) {
      const preset = await prisma.exportPreset.findUnique({
        where: { id: presetId },
        select: { id: true },
      });
      if (!preset) throw validationError("Preset d'export introuvable");
      data.export_preset = { connect: { id: presetId } };
    } else {
      data.export_preset = { disconnect: true };
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data,
    include: { export_preset: true, shots: { orderBy: { position: "asc" } } },
  });

  return { ...project, total_duration_seconds: totalDuration(project.shots) };
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  return { id };
}

function normalizeShotFields(body: Record<string, unknown>, requireTitle: boolean) {
  const data: Prisma.SceneShotUpdateInput = {};

  for (const field of SHOT_TEXT_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === "title") {
      const title = normalizeText(body.title);
      if (!title && requireTitle) throw validationError("Le titre du plan est requis");
      if (title) data.title = title;
      continue;
    }
    data[field] = normalizeText(body[field]);
  }

  if (body.duration_seconds !== undefined) {
    data.duration_seconds = normalizeDuration(body.duration_seconds);
  }
  if (body.is_active !== undefined) data.is_active = Boolean(body.is_active);
  if (body.swap_consent_confirmed !== undefined) {
    data.swap_consent_confirmed = Boolean(body.swap_consent_confirmed);
  }

  const shotType = pickEnum<ShotType>(body.shot_type, SHOT_TYPE_OPTIONS, "shot_type");
  if (shotType) data.shot_type = shotType;

  if (body.swap_type !== undefined) {
    const swapType = normalizeText(body.swap_type);
    data.swap_type =
      pickEnum<SwapType>(swapType ?? undefined, SWAP_TYPE_OPTIONS, "swap_type") ?? null;
  }

  const renderStatus = pickEnum<RenderStatus>(
    body.render_status,
    RENDER_STATUS_OPTIONS,
    "render_status"
  );
  if (renderStatus) data.render_status = renderStatus;

  return data;
}

export async function createShot(projectId: string, body: Record<string, unknown>) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, shots: { select: { position: true }, orderBy: { position: "desc" } } },
  });
  if (!project) throw notFoundError("Projet introuvable");

  const fields = normalizeShotFields(body, false);
  const position = (project.shots[0]?.position ?? 0) + 1;

  const shot = await prisma.sceneShot.create({
    data: {
      project_id: projectId,
      position,
      title: (fields.title as string) ?? `Plan ${position}`,
      shot_type: (fields.shot_type as ShotType) ?? "GENERATION",
      duration_seconds: (fields.duration_seconds as number) ?? 5,
      voiceover: (fields.voiceover as string | null) ?? null,
      action: (fields.action as string | null) ?? null,
      hook: (fields.hook as string | null) ?? null,
      visual_prompt: (fields.visual_prompt as string | null) ?? null,
      consistency_notes: (fields.consistency_notes as string | null) ?? null,
      swap_type: (fields.swap_type as SwapType | null) ?? null,
      swap_source_ref: (fields.swap_source_ref as string | null) ?? null,
      swap_target_ref: (fields.swap_target_ref as string | null) ?? null,
      swap_preserve_zones: (fields.swap_preserve_zones as string | null) ?? null,
      swap_consent_confirmed: (fields.swap_consent_confirmed as boolean) ?? false,
      transition_in: (fields.transition_in as string | null) ?? null,
      transition_out: (fields.transition_out as string | null) ?? null,
      pacing: (fields.pacing as string | null) ?? null,
      subtitle_text: (fields.subtitle_text as string | null) ?? null,
      audio_track: (fields.audio_track as string | null) ?? null,
      render_status: (fields.render_status as RenderStatus) ?? "DRAFT",
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { updated_at: new Date() },
  });

  return shot;
}

export async function updateShot(shotId: string, body: Record<string, unknown>) {
  const existing = await prisma.sceneShot.findUnique({
    where: { id: shotId },
    select: { id: true, project_id: true },
  });
  if (!existing) throw notFoundError("Plan introuvable");

  const shot = await prisma.sceneShot.update({
    where: { id: shotId },
    data: normalizeShotFields(body, true),
  });

  await prisma.project.update({
    where: { id: existing.project_id },
    data: { updated_at: new Date() },
  });

  return shot;
}

export async function deleteShot(shotId: string) {
  const existing = await prisma.sceneShot.findUnique({
    where: { id: shotId },
    select: { id: true, project_id: true },
  });
  if (!existing) throw notFoundError("Plan introuvable");

  await prisma.sceneShot.delete({ where: { id: shotId } });

  const remaining = await prisma.sceneShot.findMany({
    where: { project_id: existing.project_id },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  await prisma.$transaction(
    remaining.map((shot, index) =>
      prisma.sceneShot.update({ where: { id: shot.id }, data: { position: index + 1 } })
    )
  );

  return { id: shotId };
}

export async function reorderShots(projectId: string, order: unknown) {
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
    throw validationError("Ordre des plans invalide");
  }

  const shots = await prisma.sceneShot.findMany({
    where: { project_id: projectId },
    select: { id: true },
  });
  const ids = new Set(shots.map((shot) => shot.id));
  const requested = order as string[];

  if (requested.length !== ids.size || requested.some((id) => !ids.has(id))) {
    throw validationError("L'ordre fourni ne correspond pas aux plans du projet");
  }

  await prisma.$transaction(
    requested.map((id, index) =>
      prisma.sceneShot.update({ where: { id }, data: { position: index + 1 } })
    )
  );

  return getProject(projectId);
}

export async function setRenderStatus(
  shotId: string,
  status: RenderStatus,
  notes?: string | null
) {
  const shot = await prisma.sceneShot.update({
    where: { id: shotId },
    data: { render_status: status, render_notes: notes ?? undefined },
  });
  return shot;
}

export async function dispatchToEngine(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });

  return { ok: response.ok, status: response.status };
}
