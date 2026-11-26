"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, X } from "lucide-react";
import { Button, cx } from "./ui";

type Props = {
  state: {
    plan: unknown;
    summary: string;
    dispatch: { attempted: boolean; ok?: boolean; status?: number; message: string };
  };
  onClose: () => void;
  notify: (kind: "success" | "error", message: string) => void;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export default function ExportDialog({ state, onClose, notify }: Props) {
  const [tab, setTab] = useState<"json" | "summary">("json");
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(state.plan, null, 2);
  const content = tab === "json" ? json : state.summary;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleCopy() {
    const ok = await copyText(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      notify("success", "Copié dans le presse-papiers");
    } else {
      notify("error", "Copie impossible depuis ce navigateur");
    }
  }

  function handleDownload() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "videoflow-production-plan.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Plan de production"
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] text-zinc-200 [color-scheme:dark]">
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-white">Plan de production</h2>
            <p className="mt-1 text-xs text-zinc-500">{state.dispatch.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex items-center gap-1 border-b border-white/[0.07] px-4 py-2">
          {(
            [
              { key: "json", label: "JSON structuré" },
              { key: "summary", label: "Résumé lisible" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cx(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                tab === item.key
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <pre className="min-h-[220px] flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[11px] leading-relaxed text-zinc-300">
          {content}
        </pre>

        <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] px-4 py-3">
          <Button variant="ghost" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />} Copier {tab === "json" ? "le JSON" : "le résumé"}
          </Button>
          <Button variant="ghost" onClick={handleDownload}>
            <Download size={13} /> Télécharger .json
          </Button>
          <Button variant="subtle" className="ml-auto" onClick={onClose}>
            Fermer
          </Button>
        </footer>
      </div>
    </div>
  );
}
