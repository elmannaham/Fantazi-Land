"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Star, ArrowRight, ShieldCheck, Eye, Zap, Layers } from "lucide-react";
import type { ProfileWithStats } from "@/lib/types";

interface BentoCreatorGridProps {
  creators: ProfileWithStats[];
  onBookCreator?: (creator: ProfileWithStats) => void;
}

export function BentoCreatorGrid({
  creators,
  onBookCreator,
}: BentoCreatorGridProps) {
  if (creators.length === 0) return null;

  const starCreator = creators[0];
  const secondaryCreators = creators.slice(1, 4);

  return (
    <div className="my-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-bold text-purple-800 backdrop-blur-md mb-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
            Sélection Prestige
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Talents à la Une
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
          Les hôtesses les plus sollicitées pour vos événements et campagnes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {/* Grande Carte Bento (Hero Creator) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-black p-6 sm:p-8 text-white border border-purple-500/20 shadow-xl flex flex-col justify-between group"
        >
          {/* Subtle glow circle */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-all" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-purple-200 backdrop-blur-md border border-white/10">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Hôtesse Star du Moment
              </span>
              <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {Number(starCreator.performance_stats?.avg_rating || 5.0).toFixed(1)}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                {starCreator.avatar_url ? (
                  <img
                    src={starCreator.avatar_url}
                    alt={starCreator.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-2xl"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-3xl font-extrabold text-white shadow-xl">
                    {starCreator.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white shadow-md ring-2 ring-slate-900">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
                  {starCreator.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                  {starCreator.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1 max-w-sm">
                  {starCreator.bio || "Hôtesse professionnelle d'exception disponible pour des événements et missions haut de gamme."}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Tarif horaire</span>
              <p className="text-xl font-bold text-white">
                {Number(starCreator.base_rate || 150)} {starCreator.currency || "EUR"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/profiles/${starCreator.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <Eye className="h-3.5 w-3.5" />
                Voir Profil
              </Link>
              <button
                onClick={() => onBookCreator?.(starCreator)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 active:scale-95"
              >
                Réserver
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Colonne Cartes Secondaires */}
        <div className="md:col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {secondaryCreators.map((creator) => (
            <motion.div
              key={creator.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.name}
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-purple-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                      {creator.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{creator.name}</h4>
                    <span className="text-[11px] font-semibold text-purple-600 capitalize">
                      {creator.category}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {Number(creator.performance_stats?.avg_rating || 5.0).toFixed(1)}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {Number(creator.base_rate || 100)} {creator.currency || "EUR"}
                  <span className="text-[10px] text-slate-400 font-normal">/h</span>
                </span>

                <div className="flex gap-1.5">
                  <Link
                    href={`/profiles/${creator.id}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => onBookCreator?.(creator)}
                    className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-sm"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Mini Carte Teaser Portfolio 3D */}
          <Link
            href="/portfolio"
            className="group rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-5 border border-purple-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-200/60 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                <Layers className="h-3 w-3 text-purple-700" />
                Expérience Immersive
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mt-2 group-hover:text-purple-700 transition-colors">
                Galerie Portfolio 3D
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Faites tourner les carrousels 3D interactifs de nos hôtesses.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700">
              Explorer en 3D <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
