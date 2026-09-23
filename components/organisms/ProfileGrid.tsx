"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Calendar, Eye } from "lucide-react";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { formatRate } from "@/lib/format";
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
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
    >
      {profiles.map((profile, index) => {
        const avatarSrc = profile.avatar_url || (profile as any).avatar || undefined;
        const rate = profile.base_rate ?? (profile as any).baseRate ?? 500;
        const score = Number(profile.performance_stats?.avg_rating ?? (profile as any).rating ?? 5.0);
        const reviews = profile.performance_stats?.total_reviews ?? (profile as any).reviewCount ?? 0;
        const isPriority = index < 4; // LCP & fast rendering for above the fold

        return (
          <motion.div
            key={profile.id}
            variants={cardVariants}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-[2rem] border border-slate-200/80 bg-white p-2 sm:p-3 shadow-sm hover:shadow-2xl hover:border-purple-300 transition-all duration-300"
          >
            <div>
              {/* Photo Avatar en Format Portrait Élégant avec Coins Arrondis */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl sm:rounded-[1.5rem] bg-slate-900 shadow-inner">
                {avatarSrc ? (
                  <OptimizedImage
                    src={avatarSrc}
                    alt={profile.name}
                    fill
                    priority={isPriority}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    fallbackInitials={profile.name.charAt(0)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-500 text-4xl font-extrabold text-white">
                    {profile.name.charAt(0)}
                  </div>
                )}

                {/* Gradient d'ombre subtil en bas de l'image */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                {/* Badge Note Flottant */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black text-amber-300 backdrop-blur-md border border-white/10 shadow-sm z-20">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                  <span>{Number(score).toFixed(1)}</span>
                </div>

                {/* Badge Disponibilité & Catégorie */}
                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1 z-20">
                  <span className="hidden sm:inline truncate rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-purple-900 shadow-md backdrop-blur-sm uppercase tracking-widest">
                    {profile.category}
                  </span>

                  {profile.is_available !== false && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-black text-white shadow-md backdrop-blur-sm border border-white/20">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      DISPO
                    </span>
                  )}
                </div>
              </div>

              {/* Détails du Profil */}
              <div className="pt-3 sm:pt-4 px-1 sm:px-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                      <h3 className="truncate font-black text-base sm:text-xl text-slate-900 group-hover:text-purple-700 transition-colors tracking-tighter">
                        {profile.name}
                      </h3>
                      <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                    </div>
                    {reviews > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviews} AVIS VÉRIFIÉS</span>
                    )}
                    <span className="sm:hidden block text-[10px] font-bold text-purple-700 uppercase tracking-wider truncate">{profile.category}</span>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-sm sm:text-lg font-black text-purple-900 tracking-tighter">
                      {formatRate(rate, profile.currency)}
                    </span>
                    <span className="sm:block ml-1 sm:ml-0 text-[9px] font-black text-slate-400 uppercase">/ HEURE</span>
                  </div>
                </div>

                <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 font-medium italic">
                  "{profile.bio || "Hôtesse événementielle d'exception et égérie certifiée."}"
                </p>
              </div>
            </div>

            {/* Pied de Carte : Actions */}
            <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center gap-2 sm:gap-2.5 px-0.5 sm:px-1">
              <Link
                href={`/profiles/${profile.id}`}
                aria-label={`Voir le profil de ${profile.name}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl bg-slate-50 py-2.5 sm:py-3 text-xs font-black uppercase tracking-tighter text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all active:scale-95 border border-slate-100"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">VOIR</span>
              </Link>

              <button
                type="button"
                onClick={() => handleBooking?.(profile)}
                aria-label={`Réserver ${profile.name}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl bg-slate-950 py-2.5 sm:py-3 text-xs font-black uppercase tracking-tighter text-white shadow-xl hover:bg-purple-600 transition-all active:scale-95"
              >
                <Calendar className="h-4 w-4" />
                BOOK
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
