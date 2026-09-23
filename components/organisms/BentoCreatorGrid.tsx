"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Star, ArrowRight, ShieldCheck, Eye, Zap, Layers } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { formatRate } from "@/lib/format";
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

  // Optimisation de la sélection : Trier par note puis par projets pour avoir les meilleures en vedette
  const sortedCreators = [...creators].sort((a, b) => {
    const scoreA = (a.performance_stats?.avg_rating || 0) * (a.performance_stats?.total_projects || 1);
    const scoreB = (b.performance_stats?.avg_rating || 0) * (b.performance_stats?.total_projects || 1);
    return scoreB - scoreA;
  });

  const starCreator = sortedCreators[0];
  // Deux cartes secondaires empilées : la colonne droite reste pleine, sans carte orpheline
  const secondaryCreators = sortedCreators.slice(1, 3);
  const starProjects = starCreator.performance_stats?.total_projects ?? 0;

  return (
    <div className="my-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/80 px-4 py-1.5 text-xs font-black text-purple-800 backdrop-blur-md mb-3 border border-purple-200">
            <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
            SÉLECTION PRESTIGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
            Talents <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">à la Une</span>
          </h2>
        </div>
        <p className="text-sm text-slate-500 max-w-sm font-medium border-l-2 border-purple-200 pl-4">
          Découvrez notre sélection exclusive d'hôtesses d'exception pour vos projets les plus prestigieux.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Grande Carte Bento (Hero Creator) - Version Optimisée */}
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-10 text-white border border-white/10 shadow-2xl flex flex-col justify-between group h-full min-h-[420px]"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(219,39,119,0.15),transparent_50%)]" />
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px] group-hover:bg-purple-600/20 transition-all duration-700" />
          
          <div className="relative z-10 flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-200 backdrop-blur-xl border border-white/20">
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                STAR EXCLUSIVE
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1.5 text-xs font-black text-slate-950 backdrop-blur-md shadow-lg shadow-amber-400/20">
                <Star className="h-3.5 w-3.5 fill-slate-950" />
                {(starCreator.performance_stats?.total_reviews ?? 0) > 0
                  ? Number(starCreator.performance_stats?.avg_rating).toFixed(1)
                  : "NOUVEAU"}
              </div>
            </div>

            <div className="my-auto pt-10 flex flex-col sm:flex-row items-center gap-8">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-56 lg:w-56 overflow-hidden rounded-3xl ring-8 ring-white/5 shadow-[0_0_50px_rgba(139,92,246,0.3)] shrink-0 bg-slate-800 group-hover:ring-purple-500/20 transition-all duration-500">
                {starCreator.avatar_url ? (
                  <OptimizedImage
                    src={starCreator.avatar_url}
                    alt={starCreator.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 224px"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    fallbackInitials={starCreator.name.charAt(0)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-500 text-5xl font-black text-white">
                    {starCreator.name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 text-white shadow-xl ring-4 ring-slate-950 z-20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-black tracking-[0.2em] text-purple-400 mb-2 block">
                  {starCreator.category}
                </span>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mt-1 leading-none group-hover:text-purple-300 transition-colors">
                  {starCreator.name}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 line-clamp-2 mt-4 max-w-sm font-medium leading-relaxed">
                  {starCreator.bio || "Hôtesse professionnelle d'exception disponible pour des événements et missions haut de gamme."}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-400">
                  {starProjects > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <Layers className="h-3.5 w-3.5" />
                      {starProjects} PROJETS
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Eye className="h-3.5 w-3.5" />
                    PROFIL VÉRIFIÉ
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">À partir de</span>
              <p className="text-3xl font-black text-white tracking-tighter whitespace-nowrap">
                {formatRate(starCreator.base_rate, starCreator.currency)}
                <span className="text-base ml-1 font-bold text-slate-400">/ heure</span>
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-center">
              <Link
                href={`/profiles/${starCreator.id}`}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all border border-white/10 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Eye className="h-4 w-4" />
                PROFIL
              </Link>
              <button
                type="button"
                onClick={() => onBookCreator?.(starCreator)}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.5)] active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                RÉSERVER
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cartes Secondaires Bento - Version Optimisée */}
        <div className="hidden md:grid grid-cols-1 gap-6">
          {secondaryCreators.map((creator) => (
            <motion.div
              key={creator.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[2rem] bg-white p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-300 hover:shadow-2xl transition-all h-full"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-black text-purple-700 uppercase tracking-widest border border-purple-100">
                    {creator.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    <Star className="h-3 w-3 fill-amber-500" />
                    {(creator.performance_stats?.total_reviews ?? 0) > 0
                      ? Number(creator.performance_stats?.avg_rating).toFixed(1)
                      : "NOUVEAU"}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative h-24 w-24 overflow-hidden rounded-[1.5rem] bg-slate-100 ring-4 ring-purple-50 shrink-0 group-hover:ring-purple-200 transition-all duration-500 mb-4">
                    {creator.avatar_url ? (
                      <OptimizedImage
                        src={creator.avatar_url}
                        alt={creator.name}
                        fill
                        sizes="96px"
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackInitials={creator.name.charAt(0)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-500 to-pink-500 text-3xl font-black text-white">
                        {creator.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h4 className="font-black text-xl text-slate-900 truncate w-full group-hover:text-purple-700 transition-colors tracking-tight">
                    {creator.name}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-1 px-2">
                    {creator.bio || "Hôtesse certifiée"}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-black block tracking-tighter">TARIF / HEURE</span>
                  <span className="text-lg font-black text-purple-900 tracking-tight">
                    {formatRate(creator.base_rate, creator.currency)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/profiles/${creator.id}`}>
                    <button className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-purple-600 hover:text-white transition-all duration-300">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => onBookCreator?.(creator)}
                    className="rounded-xl bg-slate-900 hover:bg-purple-600 px-4 py-2.5 text-xs font-black uppercase tracking-tighter text-white shadow-sm transition-all duration-300 active:scale-95"
                  >
                    BOOK
                  </button>
                </div>
              </div>

              {/* Subtle hover pattern */}
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                <div className="h-16 w-16 border-r-2 border-t-2 border-purple-600 rounded-tr-3xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

