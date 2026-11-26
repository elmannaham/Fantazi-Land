"use client";

import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { SceneShot } from "@prisma/client";
import { RENDER_STATUS_META, SHOT_TYPE_META } from "@/lib/studio/constants";
import { formatDuration } from "@/lib/studio/plan";
import { Badge, Button, cx } from "./ui";

type Props = {
  shots: SceneShot[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onNewShot: () => void;
};

const TYPE_GRADIENT: Record<SceneShot["shot_type"], string> = {
  GENERATION: "from-violet-500/25 to-indigo-500/10",
  SWAP: "from-amber-500/25 to-orange-500/10",
  EXISTING_CLIP: "from-sky-500/25 to-cyan-500/10",
  EDIT: "from-emerald-500/25 to-teal-500/10",
};

export default function ShotList({
  shots,
  selectedId,
  busy,
  onSelect,
  onMove,
  onNewShot,
}: Props) {
  return (
    <section className="flex min-h-0 flex-col rounded-2xl border border-white/[0.07] bg-[#111116]">
      <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Storyboard & Timeline
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{shots.length} plan(s) dans l&apos;ordre</p>
        </div>
        <Button variant="ghost" onClick={onNewShot} disabled={busy} className="h-8 px-2">
          <Plus size={13} />
        </Button>
      </header>

      <div className="max-h-[520px] space-y-1.5 overflow-y-auto px-2 py-2 lg:max-h-[calc(100vh-260px)]">
        {shots.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-zinc-500">
            Aucun plan pour l&apos;instant. Ajoutez votre premier plan pour démarrer le storyboard.
          </p>
        )}

        {shots.map((shot, index) => {
          const type = SHOT_TYPE_META[shot.shot_type];
          const status = RENDER_STATUS_META[shot.render_status];
          const selected = shot.id === selectedId;

          return (
            <div
              key={shot.id}
              className={cx(
                "group relative rounded-xl border transition",
                selected
                  ? "border-violet-500/50 bg-violet-500/[0.07]"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                !shot.is_active && "opacity-60"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(shot.id)}
                aria-current={selected}
                className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left"
              >
                <span className="mt-0.5 w-5 shrink-0 text-center text-[11px] font-semibold text-zinc-500">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={cx(
                    "relative flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ring-1 ring-inset ring-white/10",
                    TYPE_GRADIENT[shot.shot_type]
                  )}
                >
                  {shot.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shot.thumbnail_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className={cx("h-1.5 w-1.5 rounded-full", type.dot)} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {shot.title}
                    </span>
                    <span
                      className={cx("h-1.5 w-1.5 shrink-0 rounded-full", status.dot)}
                      title={status.label}
                    />
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge className={type.badge}>{type.label}</Badge>
                    <span className="text-[11px] text-zinc-500">
                      {formatDuration(shot.duration_seconds)}
                    </span>
                    {!shot.is_active && (
                      <span className="text-[11px] text-zinc-600">hors montage</span>
                    )}
                  </span>
                </span>
              </button>

              <div className="absolute right-1 top-1.5 flex flex-col gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  aria-label={`Monter ${shot.title}`}
                  disabled={busy || index === 0}
                  onClick={() => onMove(shot.id, "up")}
                  className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-100 disabled:opacity-25"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Descendre ${shot.title}`}
                  disabled={busy || index === shots.length - 1}
                  onClick={() => onMove(shot.id, "down")}
                  className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-100 disabled:opacity-25"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
