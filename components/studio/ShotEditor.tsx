"use client";

import { useMemo, useState } from "react";
import {
  RotateCcw,
  Save,
  Scissors,
  ShieldAlert,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import type { SceneShot } from "@prisma/client";
import {
  PACING_OPTIONS,
  RENDER_STATUS_META,
  RENDER_STATUS_OPTIONS,
  SHOT_TYPE_META,
  SHOT_TYPE_OPTIONS,
  SWAP_TYPE_META,
  SWAP_TYPE_OPTIONS,
  TRANSITION_OPTIONS,
} from "@/lib/studio/constants";
import { formatDuration } from "@/lib/studio/plan";
import { shotToDraft, type ShotDraft } from "@/lib/studio/types";
import { Badge, Button, Field, Panel, Select, TextArea, TextInput, cx } from "./ui";

type Props = {
  shot: SceneShot;
  position: number;
  busy: boolean;
  onSave: (draft: ShotDraft) => Promise<void>;
  onDelete: () => Promise<void>;
};

function withCurrent(options: string[], current: string) {
  const base = ["", ...options];
  return current && !base.includes(current) ? [...base, current] : base;
}

function toOptions(values: string[], emptyLabel: string) {
  return values.map((value) => ({
    value,
    label: value === "" ? emptyLabel : value,
  }));
}

export default function ShotEditor({ shot, position, busy, onSave, onDelete }: Props) {
  const saved = useMemo(() => shotToDraft(shot), [shot]);
  const [draft, setDraft] = useState<ShotDraft>(saved);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const needsConsent = Boolean(draft.swap_type) && !draft.swap_consent_confirmed;

  function set<K extends keyof ShotDraft>(key: K, value: ShotDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (needsConsent) {
      setError(
        "Attestation obligatoire : confirmez détenir les droits et le consentement explicite avant d'enregistrer un swap."
      );
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <Panel
        className="overflow-hidden"
        bodyClassName="px-4 py-4"
        title={`Plan ${String(position).padStart(2, "0")} · Éditeur`}
        subtitle="Script, génération, swap et montage du plan sélectionné"
        action={
          <div className="flex items-center gap-2">
            <Badge className={SHOT_TYPE_META[draft.shot_type].badge}>
              {SHOT_TYPE_META[draft.shot_type].label}
            </Badge>
            <Badge className={RENDER_STATUS_META[draft.render_status].badge}>
              {RENDER_STATUS_META[draft.render_status].label}
            </Badge>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_110px]">
          <Field label="Titre du plan">
            <TextInput
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="Ex. Accroche produit en gros plan"
            />
          </Field>
          <Field label="Type de plan">
            <Select
              value={draft.shot_type}
              onChange={(event) => set("shot_type", event.target.value as ShotDraft["shot_type"])}
              options={SHOT_TYPE_OPTIONS.map((type) => ({
                value: type,
                label: SHOT_TYPE_META[type].label,
              }))}
            />
          </Field>
          <Field label="Durée" hint={formatDuration(draft.duration_seconds)}>
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={1}
                max={600}
                value={draft.duration_seconds}
                onChange={(event) =>
                  set("duration_seconds", Math.max(1, Number(event.target.value) || 1))
                }
                className="w-full"
              />
              <span className="text-xs text-zinc-500">s</span>
            </div>
          </Field>
        </div>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(event) => set("is_active", event.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-violet-500"
          />
          Inclure ce plan dans la durée totale et le montage final
        </label>
      </Panel>

      {/* Script & intention */}
      <Panel
        title="Script & intention"
        subtitle="Ce que le plan raconte, avant toute génération"
        action={<Type size={14} className="text-zinc-500" />}
      >
        <div className="space-y-3">
          <Field label="Voix off / dialogue">
            <TextArea
              rows={2}
              value={draft.voiceover}
              onChange={(event) => set("voiceover", event.target.value)}
              placeholder="« Trois secondes pour changer ta routine… »"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Action">
              <TextArea
                rows={3}
                value={draft.action}
                onChange={(event) => set("action", event.target.value)}
                placeholder="Ce qui se passe à l'image"
              />
            </Field>
            <Field label="Accroche (hook)" hint="La phrase ou l'image qui retient dès la première seconde">
              <TextArea
                rows={3}
                value={draft.hook}
                onChange={(event) => set("hook", event.target.value)}
                placeholder="Ex. Ouverture sur un détail inattendu"
              />
            </Field>
          </div>
        </div>
      </Panel>

      {/* Génération */}
      <Panel
        title="Génération vidéo"
        subtitle="Prompt visuel détaillé et cohérence entre les plans"
        action={<Sparkles size={14} className="text-violet-300" />}
      >
        <div className="space-y-3">
          <Field
            label="Prompt visuel"
            hint="Sujet · action · cadrage · lumière · mouvement de caméra · style"
          >
            <TextArea
              rows={5}
              value={draft.visual_prompt}
              onChange={(event) => set("visual_prompt", event.target.value)}
              placeholder="Ex. Femme aux cheveux courts, veste en cuir, gros plan épaule, lumière néon magenta latérale, travelling avant lent, rendu cinématographique 35 mm"
            />
          </Field>
          <Field label="Notes de cohérence" hint="Personnage, décor, palette, raccords avec les autres plans">
            <TextArea
              rows={2}
              value={draft.consistency_notes}
              onChange={(event) => set("consistency_notes", event.target.value)}
              placeholder="Même tenue que les plans 01 et 04, palette froide"
            />
          </Field>
        </div>
      </Panel>

      {/* Swap */}
      <Panel
        className="border-amber-500/20"
        title="Swap"
        subtitle="Remplacement d'identité, de personnage ou d'élément visuel"
        action={<ShieldAlert size={14} className="text-amber-300" />}
      >
        <div className="mb-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/90">
          <strong className="font-semibold">Droits & consentement obligatoires.</strong> Toute
          opération de swap impliquant une personne réelle exige son consentement explicite et
          les droits sur les médias sources. L&apos;attestation ci-dessous est requise pour
          enregistrer le plan.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type de swap">
            <Select
              value={draft.swap_type}
              onChange={(event) => {
                const value = event.target.value as ShotDraft["swap_type"];
                set("swap_type", value);
                if (!value) set("swap_consent_confirmed", false);
              }}
              options={[
                { value: "", label: "Aucun swap sur ce plan" },
                ...SWAP_TYPE_OPTIONS.map((type) => ({
                  value: type,
                  label: SWAP_TYPE_META[type].label,
                })),
              ]}
            />
          </Field>
          <Field label="Référence source" hint="Fichier ou identifiant du média à incruster">
            <TextInput
              value={draft.swap_source_ref}
              onChange={(event) => set("swap_source_ref", event.target.value)}
              placeholder="s3://studio/refs/visage-01.mp4"
            />
          </Field>
          <Field label="Cible" hint="Plan, personnage ou zone recevant le swap">
            <TextInput
              value={draft.swap_target_ref}
              onChange={(event) => set("swap_target_ref", event.target.value)}
              placeholder="Plan 02 — sujet principal"
            />
          </Field>
          <Field label="Zones à préserver" hint="À exclure du swap pour éviter les artefacts">
            <TextInput
              value={draft.swap_preserve_zones}
              onChange={(event) => set("swap_preserve_zones", event.target.value)}
              placeholder="Mains, bijoux, arrière-plan"
            />
          </Field>
        </div>

        <label
          className={cx(
            "mt-3 flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs leading-relaxed transition",
            draft.swap_consent_confirmed
              ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-100/90"
              : "border-white/10 bg-white/[0.02] text-zinc-400"
          )}
        >
          <input
            type="checkbox"
            checked={draft.swap_consent_confirmed}
            onChange={(event) => set("swap_consent_confirmed", event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/20 bg-transparent accent-emerald-500"
          />
          <span>
            J&apos;atteste détenir les droits sur les médias utilisés et le consentement explicite
            de la personne concernée pour cette opération de swap.
          </span>
        </label>
      </Panel>

      {/* Montage */}
      <Panel
        title="Montage"
        subtitle="Transition, rythme, sous-titres, audio et statut de rendu"
        action={<Scissors size={14} className="text-emerald-300" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Transition d'entrée">
            <Select
              value={draft.transition_in}
              onChange={(event) => set("transition_in", event.target.value)}
              options={toOptions(withCurrent(TRANSITION_OPTIONS, draft.transition_in), "—")}
            />
          </Field>
          <Field label="Transition de sortie">
            <Select
              value={draft.transition_out}
              onChange={(event) => set("transition_out", event.target.value)}
              options={toOptions(withCurrent(TRANSITION_OPTIONS, draft.transition_out), "—")}
            />
          </Field>
          <Field label="Rythme / coupe">
            <Select
              value={draft.pacing}
              onChange={(event) => set("pacing", event.target.value)}
              options={toOptions(withCurrent(PACING_OPTIONS, draft.pacing), "—")}
            />
          </Field>
          <Field label="Statut de rendu">
            <Select
              value={draft.render_status}
              onChange={(event) =>
                set("render_status", event.target.value as ShotDraft["render_status"])
              }
              options={RENDER_STATUS_OPTIONS.map((status) => ({
                value: status,
                label: RENDER_STATUS_META[status].label,
              }))}
            />
          </Field>
          <Field label="Texte / sous-titres">
            <TextInput
              value={draft.subtitle_text}
              onChange={(event) => set("subtitle_text", event.target.value)}
              placeholder="Texte affiché à l'écran"
            />
          </Field>
          <Field label="Piste audio / SFX">
            <TextInput
              value={draft.audio_track}
              onChange={(event) => set("audio_track", event.target.value)}
              placeholder="Ex. Beat « Neon Drive » — drop à 0:04"
            />
          </Field>
        </div>
        <Field label="Notes de rendu" className="mt-3">
          <TextArea
            rows={2}
            value={draft.render_notes}
            onChange={(event) => set("render_notes", event.target.value)}
            placeholder="Retours du moteur, corrections à appliquer…"
          />
        </Field>
      </Panel>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#0e0e13]/95 px-3 py-2.5 backdrop-blur">
        <span
          className={cx(
            "text-[11px]",
            dirty ? "text-amber-300" : "text-zinc-500"
          )}
        >
          {dirty ? "Modifications non enregistrées" : "Plan à jour"}
        </span>
        {error && <span className="text-[11px] text-rose-300">{error}</span>}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="subtle"
            onClick={() => {
              setDraft(saved);
              setError(null);
            }}
            disabled={!dirty || saving}
          >
            <RotateCcw size={13} /> Réinitialiser
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={busy || saving}>
            <Trash2 size={13} /> Supprimer
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!dirty || saving}>
            <Save size={13} /> {saving ? "Enregistrement…" : "Enregistrer le plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
