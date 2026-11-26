"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Link2,
  Radio,
  Send,
} from "lucide-react";
import type { ExportPreset } from "@prisma/client";
import { FORMAT_SPECS } from "@/lib/studio/constants";
import {
  activeShots,
  formatDuration,
  formatTimecode,
  qualityChecklist,
  totalDuration,
} from "@/lib/studio/plan";
import type { ProjectDetail } from "@/lib/studio/types";
import { Button, Field, Panel, Select, TextInput, cx } from "./ui";

type Props = {
  project: ProjectDetail;
  presets: ExportPreset[];
  busy: boolean;
  onUpdateProject: (patch: Record<string, unknown>) => Promise<void>;
  onExport: (dispatch: boolean) => Promise<void>;
};

export default function MontagePanel({
  project,
  presets,
  busy,
  onUpdateProject,
  onExport,
}: Props) {
  const [webhook, setWebhook] = useState(project.engine_webhook_url ?? "");
  const [savingWebhook, setSavingWebhook] = useState(false);

  useEffect(() => {
    setWebhook(project.engine_webhook_url ?? "");
  }, [project.id, project.engine_webhook_url]);

  const shots = activeShots(project.shots);
  const duration = totalDuration(project.shots);
  const average = shots.length ? Math.round(duration / shots.length) : 0;
  const checks = qualityChecklist(project.shots);
  const passed = checks.filter((check) => check.ok).length;
  const preset = project.export_preset;
  const spec = FORMAT_SPECS[project.format];

  let cursor = 0;
  const timeline = shots.map((shot) => {
    const start = cursor;
    cursor += shot.duration_seconds;
    return { shot, start, end: cursor };
  });

  async function saveWebhook() {
    setSavingWebhook(true);
    try {
      await onUpdateProject({ engine_webhook_url: webhook.trim() || null });
    } finally {
      setSavingWebhook(false);
    }
  }

  return (
    <div className="space-y-3">
      <Panel
        title="Récapitulatif montage"
        subtitle={`${shots.length} plans actifs · ${formatDuration(duration)} estimé`}
        action={
          <span className="rounded-md border border-white/10 bg-[#0a0a0f] px-2 py-1 text-[11px] font-semibold text-zinc-200">
            {spec.label}
          </span>
        }
      >
        <ol className="space-y-1">
          {timeline.length === 0 && (
            <li className="py-2 text-xs text-zinc-500">Aucun plan actif dans le montage.</li>
          )}
          {timeline.map(({ shot, start, end }, index) => (
            <li
              key={shot.id}
              className="flex items-baseline gap-2 rounded-md px-1 py-1 text-xs odd:bg-white/[0.02]"
            >
              <span className="w-4 shrink-0 text-zinc-600">{index + 1}</span>
              <span className="truncate text-zinc-300">{shot.title}</span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-zinc-500">
                {formatTimecode(start)}–{formatTimecode(end)}
              </span>
            </li>
          ))}
        </ol>

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-center">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Durée</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-100">
              {formatDuration(duration)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Plans</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-100">{shots.length}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Moyenne</dt>
            <dd className="mt-0.5 text-sm font-semibold text-zinc-100">{average}s</dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Checklist qualité"
        subtitle={`${passed}/${checks.length} points validés`}
        action={
          <span
            className={cx(
              "rounded-md px-2 py-1 text-[11px] font-semibold",
              passed === checks.length
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-amber-500/15 text-amber-300"
            )}
          >
            {passed === checks.length ? "Prêt" : "À compléter"}
          </span>
        }
      >
        <ul className="space-y-2">
          {checks.map((check) => (
            <li key={check.key} className="flex items-start gap-2 text-xs">
              {check.ok ? (
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
              )}
              <span>
                <span className={check.ok ? "text-zinc-300" : "text-amber-200"}>
                  {check.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                  {check.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Export"
        subtitle="Paramètres de sortie et extension moteur externe"
        action={<Download size={14} className="text-zinc-500" />}
      >
        <Field label="Preset d'export">
          <Select
            value={project.export_preset_id ?? ""}
            onChange={(event) => onUpdateProject({ export_preset_id: event.target.value || null })}
            options={[
              { value: "", label: "Sortie par défaut du format" },
              ...presets.map((item) => ({
                value: item.id,
                label: `${item.name} — ${item.resolution}`,
              })),
            ]}
          />
        </Field>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-zinc-500">Résolution</dt>
            <dd className="font-mono text-zinc-200">{preset?.resolution ?? `${spec.width}x${spec.height}`}</dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-zinc-500">Cadence</dt>
            <dd className="font-mono text-zinc-200">{preset?.fps ?? project.fps} fps</dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-zinc-500">Conteneur</dt>
            <dd className="font-mono text-zinc-200">{preset?.container ?? "mp4"}</dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
            <dt className="text-zinc-500">Sous-titres</dt>
            <dd className="font-mono text-zinc-200">
              {preset?.burned_subtitles ? "incrustés" : "piste séparée"}
            </dd>
          </div>
        </dl>

        <Field
          label="Webhook moteur externe"
          className="mt-3"
          hint="Génération, swap ou montage — laissez vide pour rester en mode brouillon."
        >
          <div className="flex gap-2">
            <TextInput
              value={webhook}
              onChange={(event) => setWebhook(event.target.value)}
              placeholder="https://mon-moteur.dev/webhooks/videoflow"
            />
            <Button
              variant="ghost"
              onClick={saveWebhook}
              disabled={busy || savingWebhook || webhook.trim() === (project.engine_webhook_url ?? "")}
            >
              <Link2 size={13} /> Lier
            </Button>
          </div>
        </Field>

        <p className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-[11px] leading-relaxed text-zinc-500">
          <Radio size={13} className="mt-0.5 shrink-0 text-violet-300" />
          Sans moteur connecté, le studio reste pleinement utilisable : les plans se planifient
          et le plan de production s&apos;exporte en JSON structuré, prêt à être branché.
        </p>

        <div className="mt-3 grid gap-2">
          <Button variant="primary" onClick={() => onExport(false)} disabled={busy}>
            <Copy size={13} /> Exporter le plan structuré
          </Button>
          <Button
            variant="ghost"
            onClick={() => onExport(true)}
            disabled={busy || !project.engine_webhook_url}
          >
            <Send size={13} /> Envoyer au moteur
          </Button>
        </div>
      </Panel>
    </div>
  );
}
