"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Images, ShieldCheck, Star } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { formatRate } from "@/lib/format";
import { hslToCss } from "@/lib/color";
import { useImageAccent } from "@/lib/hooks/useImageAccent";
import { useLoadableImages } from "@/lib/hooks/useLoadableImages";
import type { ProfileWithStats } from "@/lib/types";

const MAX_SLIDES = 6;
const SLIDE_DURATION_MS = 6000;

interface ProfileHeroProps {
  profile: ProfileWithStats;
  onBook: () => void;
  galleryAnchorId?: string;
}

/** Storage folder of a public bucket URL, e.g. ".../public/HOTESS/Alisha/Avatar.JPG" -> "hotess/alisha". */
function storageFolder(url: string | null | undefined): string | null {
  const match = url?.match(/\/object\/public\/([^/]+)\/([^/]+)\//);
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : null;
}

/**
 * Hero images: avatar first, then photos attributed to this profile only
 * (same storage folder as the avatar), no videos, deduplicated.
 * Gallery filler photos from other profiles are excluded.
 */
function getHeroImages(profile: ProfileWithStats): string[] {
  const ownFolder = storageFolder(profile.avatar_url);
  const photos = (profile.media_assets ?? [])
    .filter((m) => m.file_type === "image" && !m.file_url.toLowerCase().endsWith(".mp4"))
    .map((m) => m.file_url)
    .filter((url) => ownFolder === null || storageFolder(url) === ownFolder);
  const ordered = profile.avatar_url ? [profile.avatar_url, ...photos] : photos;
  return Array.from(new Set(ordered)).slice(0, MAX_SLIDES);
}

const identity = (url: string) => url;

export function ProfileHero({ profile, onBook, galleryAnchorId = "galerie" }: ProfileHeroProps) {
  const candidates = useMemo(() => getHeroImages(profile), [profile]);
  const images = useLoadableImages(candidates, identity);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const accent = useImageAccent(images[0]);

  const reviews = profile.performance_stats?.total_reviews ?? 0;
  const rating = Number(profile.performance_stats?.avg_rating ?? 0);
  const projects = profile.performance_stats?.total_projects ?? 0;
  const isAvailable = profile.is_available !== false;
  const activeImage = images[Math.min(activeIndex, images.length - 1)];

  // Diaporama automatique, en pause au survol/focus et désactivé si "réduire les animations"
  useEffect(() => {
    if (prefersReducedMotion || isPaused || images.length < 2) return;
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % images.length), SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion, isPaused, images.length]);

  const accentColor = hslToCss(accent);
  const style = {
    "--accent": accentColor,
    "--accent-soft": hslToCss(accent, 0.18),
    "--accent-glow": hslToCss(accent, 0.35),
  } as React.CSSProperties;

  return (
    <section
      aria-labelledby="profile-hero-title"
      className="relative isolate overflow-hidden bg-[#0b0a12] text-white"
      style={style}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Couche de fond : photos du profil en fondu enchaîné (Ken Burns) */}
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <AnimatePresence initial={false}>
          {activeImage && (
            <motion.div
              key={activeImage}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.08 }}
              animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.0 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: SLIDE_DURATION_MS / 1000 + 1.2, ease: "linear" },
              }}
            >
              <OptimizedImage
                src={activeImage}
                alt=""
                fill
                priority={activeIndex === 0}
                sizes="100vw"
                className="object-cover object-[center_25%]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voiles de lisibilité + lueur teintée par la couleur du profil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0a12] via-[#0b0a12]/85 to-[#0b0a12]/20"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#0b0a12] to-transparent" />
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 -z-10 h-[520px] w-[520px] rounded-full blur-[120px] motion-safe:animate-pulse"
        style={{ background: "var(--accent-glow)" }}
      />
      {/* Nom en filigrane */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 right-0 -z-10 select-none whitespace-nowrap font-display text-[22vw] font-extrabold uppercase leading-none tracking-tighter text-white/[0.04] sm:text-[16vw]"
      >
        {profile.name}
      </p>

      <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-between gap-10 px-5 pb-10 pt-8 sm:px-8 sm:pt-10">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Toutes les hôtesses
        </Link>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xl"
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {profile.category}
            </span>
            {isAvailable && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                Disponible
              </span>
            )}
          </div>

          <h1
            id="profile-hero-title"
            className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl"
          >
            {profile.name}
            <ShieldCheck
              className="ml-3 inline-block h-7 w-7 align-middle sm:h-9 sm:w-9"
              style={{ color: "var(--accent)" }}
              aria-label="Profil vérifié"
            />
          </h1>

          {profile.bio && (
            <p className="mt-5 line-clamp-3 max-w-lg text-base leading-relaxed text-white/75">{profile.bio}</p>
          )}

          <dl className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Tarif horaire</dt>
              <dd className="font-display text-3xl font-bold">{formatRate(profile.base_rate, profile.currency)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Avis</dt>
              <dd className="flex items-center gap-1.5 text-lg font-semibold">
                {reviews > 0 ? (
                  <>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {rating.toFixed(1)} <span className="text-sm font-normal text-white/60">({reviews})</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-white/70">Nouveau profil</span>
                )}
              </dd>
            </div>
            {projects > 0 && (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Missions</dt>
                <dd className="text-lg font-semibold">{projects}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-[#0b0a12] shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ background: "var(--accent)", boxShadow: "0 12px 32px var(--accent-glow)" }}
            >
              <CalendarCheck className="h-4 w-4" />
              Réserver {profile.name}
            </button>
            <a
              href={`#${galleryAnchorId}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <Images className="h-4 w-4" />
              Voir la galerie
            </a>
          </div>
        </motion.div>

        {/* Vignettes : navigation clavier dans le diaporama */}
        {images.length > 1 && (
          <div className="flex items-center gap-2" role="group" aria-label="Photos du profil">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Afficher la photo ${i + 1} sur ${images.length}`}
                aria-pressed={i === activeIndex}
                className={`relative h-14 w-11 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  i === activeIndex ? "border-[var(--accent)] opacity-100" : "border-transparent opacity-50 hover:opacity-90"
                }`}
              >
                <OptimizedImage src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
