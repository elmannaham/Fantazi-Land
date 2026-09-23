"use client";

import React from "react";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";

// 1 grande tuile (2x2) + 5 petites = grille 3x3 complète
const MAX_TILES = 6;

interface PortfolioTeaserSectionProps {
  /** Photos des profils (avatars) affichées en aperçu ; la section reste valable sans photo. */
  photos?: string[];
}

export function PortfolioTeaserSection({ photos = [] }: PortfolioTeaserSectionProps) {
  const tiles = Array.from(new Set(photos.filter(Boolean))).slice(0, MAX_TILES);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl border border-purple-500/30">
        {/* Glow ambient */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30 mb-4">
              <Layers className="h-3.5 w-3.5 text-purple-300" />
              Galerie Exclusive
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Découvrez notre <span className="text-pink-400">Galerie Photos</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-lg">
              Explorez l'ensemble des shootings, événements et books haute définition de nos hôtesses avec affichage aléatoire ou vue 3D interactive.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-purple-900 shadow-xl transition-all hover:bg-slate-100 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explorer la Galerie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mosaïque des vraies photos des hôtesses */}
          {tiles.length > 0 && (
            <Link
              href="/portfolio"
              aria-label="Ouvrir la galerie photos"
              className="group grid grid-cols-3 gap-2.5 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {tiles.map((src, i) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-xl border border-white/15 bg-purple-950/60 ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <OptimizedImage
                    src={src}
                    alt=""
                    fill
                    sizes={i === 0 ? "(max-width: 1024px) 60vw, 360px" : "(max-width: 1024px) 30vw, 180px"}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              ))}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
