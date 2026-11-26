"use client";

import { useState } from "react";
import { Clapperboard, Clock3, Film, Plus, Layers } from "lucide-react";
import type { ProjectStatus, VideoFormat } from "@prisma/client";
import { FPS_OPTIONS, FORMAT_OPTIONS, FORMAT_SPECS, PROJECT_STATUS_META, PROJECT_STATUS_OPTIONS } from "@/lib/studio/constants";
import { formatDuration } from "@/lib/studio/plan";
import type { ProjectDetail, ProjectSummary } from "@/lib/studio/types";
import { Badge, Button, Select, TextInput, cx } from "./ui";

type Props = {
  projects: ProjectSummary[];
  active: ProjectDetail;
  busy: boolean;
  onSelectProject: (id: string) => void;
  onCreateProject: (title: string) => Promise<void>;
  onUpdateProject: (patch: Record<string, unknown>) => Promise<void>;
  onNewShot: () => Promise<void>;
};

export default function ProjectBar({
  projects,
  active,
  busy,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onNewShot,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const spec = FORMAT_SPECS[active.format];

  async function submitProject(event: React.FormEvent) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateProject(newTitle.trim());
    setNewTitle("");
    setCreating(false);
  }

  return (
    <header className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#15151c] via-[#111116] to-[#0e0e13] px-4 py-4 lg:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/30">
            <Clapperboard className="h-4.5 w-4.5" size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-tight text-white">
              VideoFlow Studio
            </p>
            <p className="text-[11px] text-zinc-500">Planification · Génération · Swap · Montage</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              aria-label="Projet"
              value={active.id}
              onChange={(event) => onSelectProject(event.target.value)}
              className="h-9 w-full min-w-[190px] appearance-none rounded-lg border border-white/10 bg-[#0a0a0f] pl-3 pr-8 text-sm font-medium text-zinc-100 outline-none focus:border-violet-400/60"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-[#111116]">
                  {project.title}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              ▾
            </span>
          </div>
          <Button variant="ghost" onClick={() => setCreating((value) => !value)} className="h-9">
            <Plus size={14} /> Nouveau projet
          </Button>
          <Button variant="primary" onClick={onNewShot} disabled={busy} className="h-9">
            <Plus size={14} /> Nouveau plan
          </Button>
        </div>
      </div>

      {creating && (
        <form onSubmit={submitProject} className="mt-3 flex flex-wrap items-center gap-2">
          <TextInput
            autoFocus
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Titre du nouveau projet"
            className="h-9 max-w-xs"
          />
          <Button type="submit" variant="primary" disabled={busy || !newTitle.trim()} className="h-9">
            Créer
          </Button>
          <Button type="button" variant="subtle" onClick={() => setCreating(false)} className="h-9">
            Annuler
          </Button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0a0a0f] p-0.5">
          {FORMAT_OPTIONS.map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onUpdateProject({ format })}
              aria-pressed={active.format === format}
              className={cx(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
                active.format === format
                  ? "bg-violet-500/20 text-violet-200 ring-1 ring-inset ring-violet-500/40"
                  : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {FORMAT_SPECS[format as VideoFormat].label}
            </button>
          ))}
        </div>

        <Select
          aria-label="Cadence"
          value={String(active.fps)}
          onChange={(event) => onUpdateProject({ fps: Number(event.target.value) })}
          options={FPS_OPTIONS.map((fps) => ({ value: String(fps), label: `${fps} fps` }))}
          className="h-9 w-[104px]"
        />

        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0f] px-2.5 py-2 text-xs text-zinc-300">
          <Film size={13} className="text-zinc-500" />
          {spec.width}×{spec.height}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0f] px-2.5 py-2 text-xs text-zinc-300">
          <Clock3 size={13} className="text-zinc-500" />
          <span className="font-semibold text-zinc-100">
            {formatDuration(active.total_duration_seconds)}
          </span>
          <span className="text-zinc-500">estimé</span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0f] px-2.5 py-2 text-xs text-zinc-300">
          <Layers size={13} className="text-zinc-500" />
          {active.shots.filter((shot) => shot.is_active).length}/{active.shots.length} plans actifs
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Badge className={PROJECT_STATUS_META[active.status].badge}>
            {PROJECT_STATUS_META[active.status].label}
          </Badge>
          <Select
            aria-label="Statut du projet"
            value={active.status}
            onChange={(event) =>
              onUpdateProject({ status: event.target.value as ProjectStatus })
            }
            options={PROJECT_STATUS_OPTIONS.map((status) => ({
              value: status,
              label: PROJECT_STATUS_META[status].label,
            }))}
            className="h-9 w-[140px]"
          />
        </div>
      </div>
    </header>
  );
}
