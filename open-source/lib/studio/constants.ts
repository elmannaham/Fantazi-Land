import type {
  ProjectStatus,
  RenderStatus,
  ShotType,
  SwapType,
  VideoFormat,
} from "@prisma/client";

export const FORMAT_SPECS: Record<
  VideoFormat,
  { label: string; width: number; height: number; orientation: string }
> = {
  VERTICAL_9_16: {
    label: "9:16",
    width: 1080,
    height: 1920,
    orientation: "Vertical",
  },
  HORIZONTAL_16_9: {
    label: "16:9",
    width: 1920,
    height: 1080,
    orientation: "Horizontal",
  },
};

export const FPS_OPTIONS = [24, 25, 30, 60];

type Meta = { label: string; hint: string; badge: string; dot: string };

export const SHOT_TYPE_META: Record<ShotType, Meta> = {
  GENERATION: {
    label: "Génération",
    hint: "Plan produit par le moteur de génération vidéo",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    dot: "bg-violet-400",
  },
  SWAP: {
    label: "Swap",
    hint: "Plan transformé par une opération de swap",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
  EXISTING_CLIP: {
    label: "Clip existant",
    hint: "Rush déjà tourné, simplement intégré au montage",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },
  EDIT: {
    label: "Montage",
    hint: "Plan d'assemblage : titres, transitions, habillage",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
};

export const SWAP_TYPE_META: Record<SwapType, { label: string; hint: string }> = {
  FACE: { label: "Face Swap", hint: "Remplacer un visage par une identité de référence" },
  CHARACTER: {
    label: "Character / Subject Swap",
    hint: "Remplacer un personnage ou un sujet complet",
  },
  OBJECT_BACKGROUND: {
    label: "Object / Background Swap",
    hint: "Remplacer un objet, un décor ou un fond",
  },
};

export const RENDER_STATUS_META: Record<RenderStatus, Meta> = {
  DRAFT: {
    label: "Brouillon",
    hint: "Plan en cours d'écriture",
    badge: "border-zinc-600/60 bg-zinc-700/30 text-zinc-300",
    dot: "bg-zinc-400",
  },
  QUEUED: {
    label: "En file",
    hint: "Envoyé au moteur, en attente de rendu",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },
  RENDERED: {
    label: "Rendu",
    hint: "Média généré et disponible",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  REVIEW: {
    label: "À revoir",
    hint: "Rendu disponible mais à corriger",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
  },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; badge: string }> = {
  DRAFT: { label: "Brouillon", badge: "border-zinc-600/60 bg-zinc-700/30 text-zinc-300" },
  IN_PRODUCTION: {
    label: "En production",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  },
  REVIEW: { label: "En relecture", badge: "border-amber-500/30 bg-amber-500/10 text-amber-200" },
  READY: { label: "Prêt", badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" },
};

export const SHOT_TYPE_OPTIONS = Object.keys(SHOT_TYPE_META) as ShotType[];
export const SWAP_TYPE_OPTIONS = Object.keys(SWAP_TYPE_META) as SwapType[];
export const RENDER_STATUS_OPTIONS = Object.keys(RENDER_STATUS_META) as RenderStatus[];
export const PROJECT_STATUS_OPTIONS = Object.keys(PROJECT_STATUS_META) as ProjectStatus[];
export const FORMAT_OPTIONS = Object.keys(FORMAT_SPECS) as VideoFormat[];

export const TRANSITION_OPTIONS = [
  "Aucune",
  "Cut sec",
  "Fondu au noir",
  "Fondu enchaîné",
  "Whip pan",
  "Zoom punch",
  "Glitch",
  "Balayage lumineux",
];

export const PACING_OPTIONS = ["Lent", "Mesuré", "Dynamique", "Cut rapide", "Montage syncro beat"];
