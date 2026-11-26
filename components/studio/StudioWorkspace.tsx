"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { ExportPreset } from "@prisma/client";
import type { ProjectDetail, ProjectSummary, ShotDraft } from "@/lib/studio/types";
import ExportDialog from "./ExportDialog";
import MontagePanel from "./MontagePanel";
import ProjectBar from "./ProjectBar";
import ShotEditor from "./ShotEditor";
import ShotList from "./ShotList";
import { Button, cx } from "./ui";

type ExportState = {
  plan: unknown;
  summary: string;
  dispatch: { attempted: boolean; ok?: boolean; status?: number; message: string };
};

type Toast = { kind: "success" | "error"; message: string } | null;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || "La requête a échoué");
  }
  return payload.data as T;
}

export default function StudioWorkspace() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [active, setActive] = useState<ProjectDetail | null>(null);
  const [presets, setPresets] = useState<ExportPreset[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [exportState, setExportState] = useState<ExportState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((kind: "success" | "error", message: string) => {
    setToast({ kind, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const loadProject = useCallback(async (id: string) => {
    const detail = await api<ProjectDetail>(`/api/studio/projects/${id}`);
    setActive(detail);
    setSelectedShotId((current) =>
      current && detail.shots.some((shot) => shot.id === current)
        ? current
        : (detail.shots[0]?.id ?? null)
    );
    return detail;
  }, []);

  const refreshList = useCallback(
    async (preferredId?: string) => {
      const list = await api<ProjectSummary[]>("/api/studio/projects");
      setProjects(list);
      const nextId = preferredId ?? list[0]?.id;
      if (nextId) {
        await loadProject(nextId);
      } else {
        setActive(null);
        setSelectedShotId(null);
      }
    },
    [loadProject]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, presetList] = await Promise.all([
          api<ProjectSummary[]>("/api/studio/projects"),
          api<ExportPreset[]>("/api/studio/presets"),
        ]);
        if (cancelled) return;
        setProjects(list);
        setPresets(presetList);
        if (list[0]) await loadProject(list[0].id);
      } catch (error) {
        if (!cancelled) {
          notify("error", error instanceof Error ? error.message : "Chargement impossible");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProject, notify]);

  async function run<T>(
    action: () => Promise<T>,
    successMessage?: string
  ): Promise<T | undefined> {
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) notify("success", successMessage);
      return result;
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Action impossible");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  const handleSelectProject = (id: string) =>
    run(async () => {
      await loadProject(id);
    });

  const handleCreateProject = (title: string) =>
    run(async () => {
      const created = await api<ProjectDetail>("/api/studio/projects", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      await refreshList(created.id);
    }, "Projet créé");

  const handleUpdateProject = (patch: Record<string, unknown>) =>
    run(async () => {
      if (!active) return;
      const updated = await api<ProjectDetail>(`/api/studio/projects/${active.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setActive(updated);
      setProjects((current) =>
        current.map((project) => (project.id === updated.id ? { ...project, ...updated } : project))
      );
    });

  const handleNewShot = () =>
    run(async () => {
      if (!active) return;
      const shot = await api<{ id: string }>(`/api/studio/projects/${active.id}/shots`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await loadProject(active.id);
      setSelectedShotId(shot.id);
    }, "Plan ajouté");

  const handleSaveShot = (draft: ShotDraft) =>
    run(async () => {
      if (!active || !selectedShotId) return;
      await api(`/api/studio/shots/${selectedShotId}`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      await loadProject(active.id);
    }, "Plan enregistré");

  const handleDeleteShot = () =>
    run(async () => {
      if (!active || !selectedShotId) return;
      await api(`/api/studio/shots/${selectedShotId}`, { method: "DELETE" });
      setSelectedShotId(null);
      await loadProject(active.id);
    }, "Plan supprimé");

  const handleMoveShot = (shotId: string, direction: "up" | "down") =>
    run(async () => {
      if (!active) return;
      const order = active.shots.map((shot) => shot.id);
      const index = order.indexOf(shotId);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= order.length) return;
      [order[index], order[target]] = [order[target], order[index]];
      const updated = await api<ProjectDetail>(
        `/api/studio/projects/${active.id}/shots/reorder`,
        { method: "POST", body: JSON.stringify({ order }) }
      );
      setActive(updated);
    });

  const handleExport = (dispatch: boolean) =>
    run(async () => {
      if (!active) return;
      const result = await api<ExportState>(`/api/studio/projects/${active.id}/export`, {
        method: "POST",
        body: JSON.stringify({ dispatch }),
      });
      setExportState(result);
      if (result.dispatch.attempted) {
        notify(result.dispatch.ok ? "success" : "error", result.dispatch.message);
      }
    });

  const selectedShot = active?.shots.find((shot) => shot.id === selectedShotId) ?? null;
  const selectedPosition = active
    ? active.shots.findIndex((shot) => shot.id === selectedShotId) + 1
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080b] text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement du studio…
      </div>
    );
  }

  if (!active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080b] px-4 text-zinc-300">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#111116] p-6 text-center">
          <h1 className="font-display text-lg font-semibold text-white">VideoFlow Studio</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Aucun projet pour le moment. Créez votre premier projet vidéo pour planifier vos plans,
            vos générations et vos swaps.
          </p>
          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() => handleCreateProject("Mon premier projet")}
            disabled={busy}
          >
            <Plus size={14} /> Créer un projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080b] text-zinc-200 [color-scheme:dark]">
      <div className="mx-auto max-w-[1680px] px-3 py-4 sm:px-4 lg:px-6">
        <ProjectBar
          projects={projects}
          active={active}
          busy={busy}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onNewShot={handleNewShot}
        />

        <div className="mt-3 grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_350px]">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ShotList
              shots={active.shots}
              selectedId={selectedShotId}
              busy={busy}
              onSelect={setSelectedShotId}
              onMove={handleMoveShot}
              onNewShot={handleNewShot}
            />
          </div>

          <div className="min-w-0">
            {selectedShot ? (
              <ShotEditor
                key={selectedShot.id}
                shot={selectedShot}
                position={selectedPosition}
                busy={busy}
                onSave={handleSaveShot}
                onDelete={handleDeleteShot}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#111116] px-6 py-16 text-center">
                <p className="text-sm text-zinc-400">
                  Sélectionnez un plan dans le storyboard ou créez-en un nouveau.
                </p>
                <Button variant="primary" className="mt-4" onClick={handleNewShot} disabled={busy}>
                  <Plus size={14} /> Nouveau plan
                </Button>
              </div>
            )}
          </div>

          <div className="xl:sticky xl:top-4 xl:self-start">
            <MontagePanel
              project={active}
              presets={presets}
              busy={busy}
              onUpdateProject={handleUpdateProject}
              onExport={handleExport}
            />
          </div>
        </div>

        <p className="mt-4 pb-2 text-center text-[11px] text-zinc-600">
          Toute opération de swap sur une personne réelle exige des droits et un consentement
          explicite documentés dans le plan.
        </p>
      </div>

      {exportState && (
        <ExportDialog state={exportState} onClose={() => setExportState(null)} notify={notify} />
      )}

      {toast && (
        <div
          role="status"
          className={cx(
            "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-2 text-xs font-medium shadow-xl",
            toast.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
              : "border-rose-500/30 bg-rose-500/15 text-rose-100"
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
