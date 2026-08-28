"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Calendar, Eye } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import type { ProfileWithStats } from "@/lib/types";

export interface ProfileGridProps {
  profiles: ProfileWithStats[];
  isLoading?: boolean;
  onBookCreator?: (creator: ProfileWithStats) => void;
  onBookProfile?: (profile: ProfileWithStats) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export function ProfileGrid({
  profiles,
  isLoading = false,
  onBookCreator,
  onBookProfile,
}: ProfileGridProps) {
  const handleBooking = onBookCreator || onBookProfile;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse space-y-4"
          >
            <div className="aspect-square w-full rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-2/3 rounded-lg bg-slate-200" />
              <div className="h-3 w-1/3 rounded-lg bg-slate-200" />
              <div className="h-3 w-full rounded-lg bg-slate-200" />
            </div>
            <div className="h-10 w-full rounded-xl bg-slate-200 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-purple-600 mb-3">
          🔍
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Aucune hôtesse trouvée
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
          Essayez de modifier votre recherche ou sélectionnez une autre catégorie.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {profiles.map((profile, index) => {
        const avatarSrc = profile.avatar_url || (profile as any).avatar || undefined;
        const rate = profile.base_rate ?? (profile as any).baseRate ?? 500;
        const curr = profile.currency || "CAD";
        const score = Number(profile.performance_stats?.avg_rating ?? (profile as any).rating ?? 5.0);
        const reviews = profile.performance_stats?.total_reviews ?? (profile as any).reviewCount ?? 0;
        const isPriority = index < 4; // LCP & fast rendering for above the fold

        return (
          <motion.div
            key={profile.id}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:shadow-2xl hover:border-purple-300 transition-all duration-300"
          >
            <div>
              {/* Photo Avatar en Format 1:1 Carré avec Coins Arrondis */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900 shadow-inner">
                {avatarSrc ? (
                  <OptimizedImage
                    src={avatarSrc}
                    alt={profile.name}
                    fill
                    priority={isPriority}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    fallbackInitials={profile.name.charAt(0)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 text-4xl font-extrabold text-white">
                    {profile.name.charAt(0)}
                  </div>
                )}

                {/* Gradient d'ombre subtil en bas de l'image */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

                {/* Badge Note Flottant */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/10 shadow-sm z-20">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{Number(score).toFixed(1)}</span>
                  {reviews > 0 && (
                    <span className="text-[10px] text-amber-200/80 font-normal">({reviews})</span>
                  )}
                </div>

                {/* Badge Disponibilité & Catégorie */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20">
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 shadow-md backdrop-blur-sm uppercase tracking-wide">
                    {profile.category}
                  </span>

                  {profile.is_available !== false && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Dispo
                    </span>
                  )}
                </div>
              </div>

              {/* Détails du Profil */}
              <div className="pt-3 px-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-purple-700 transition-colors">
                      {profile.name}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                  </div>

                  <span className="text-sm font-extrabold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg">
                    {rate} {curr}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {profile.bio || "Hôtesse événementielle d'exception et égérie certifiée."}
                </p>
              </div>
            </div>

            {/* Pied de Carte : Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <Link href={`/profiles/${profile.id}`} className="flex-1">
                <button className="w-full flex items-center justify-center gap-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition active:scale-95">
                  <Eye className="h-3.5 w-3.5" />
                  Voir profil
                </button>
              </Link>

              <button
                onClick={() => handleBooking?.(profile)}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition"
              >
                <Calendar className="h-3.5 w-3.5" />
                Réserver
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
