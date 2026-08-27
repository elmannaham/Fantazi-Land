"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShieldCheck, MapPin, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { ProfileWithStats } from "@/lib/types";

interface ProfileGridProps {
  profiles: (ProfileWithStats | any)[];
  isLoading?: boolean;
  onSelect?: (id: string | number) => void;
  onBookCreator?: (creator: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ProfileGrid({
  profiles,
  isLoading = false,
  onSelect,
  onBookCreator,
}: ProfileGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-10 w-full rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 mb-3">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Aucun profil ne correspond aux critères</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Essayez d'ajuster votre recherche ou sélectionnez une autre catégorie.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {profiles.map((profile) => {
        const avatarSrc = profile.avatar || profile.avatar_url || undefined;
        const rate = profile.baseRate ?? profile.base_rate ?? 120;
        const curr = profile.currency || "EUR";
        const score = profile.rating ?? Number(profile.performance_stats?.avg_rating ?? 5.0);
        const reviews = profile.reviewCount ?? profile.performance_stats?.total_reviews ?? 0;
        const projects = profile.performance_stats?.total_projects ?? 0;

        return (
          <motion.div
            key={profile.id}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-purple-300/80 transition-all duration-300"
          >
            {/* Header Profil */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={profile.name}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-purple-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-xl font-extrabold text-white shadow-md">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  {profile.is_available !== false && (
                    <span
                      className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"
                      title="Disponible pour réservation"
                    />
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(score).toFixed(1)}</span>
                    <span className="text-[10px] text-amber-600/70 font-normal">({reviews})</span>
                  </div>
                  {projects > 0 && (
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">
                      {projects} missions
                    </span>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-purple-700 transition-colors">
                    {profile.name}
                  </h3>
                  <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                </div>

                <span className="inline-block rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 mb-3 capitalize">
                  {profile.category}
                </span>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {profile.bio || "Hôtesse événementielle et égérie de marque certifiée."}
                </p>
              </div>
            </div>

            {/* Pied de Carte : Tarif & CTAs */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tarif horaire</span>
                <span className="text-base font-extrabold text-slate-900">
                  {rate} {curr}
                </span>
              </div>

              <div className="flex gap-2">
                <Link href={`/profiles/${profile.id}`} className="flex-1">
                  <Button variant="outline" className="w-full text-xs py-2 rounded-xl">
                    Voir profil <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  className="flex-1 text-xs py-2 rounded-xl"
                  onClick={() => {
                    if (onBookCreator) {
                      onBookCreator(profile);
                    } else if (onSelect) {
                      onSelect(profile.id);
                    }
                  }}
                >
                  Réserver
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
