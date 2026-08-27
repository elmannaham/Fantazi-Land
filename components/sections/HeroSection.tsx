"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Star, Users, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  totalProfilesCount: number;
  onExploreClick?: () => void;
}

export function HeroSection({
  totalProfilesCount,
  onExploreClick,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 px-4 text-white">
      {/* Background Glowing Gradients & Mesh */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 opacity-30 sm:w-[72.1875rem]"
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Animated 21st.dev Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-xl shadow-lg shadow-purple-500/10 mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-pink-400 animate-ping" />
          <Sparkles className="h-3.5 w-3.5 text-purple-300" />
          <span>Plateforme Exclusive de Réservation & Booking</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
        >
          L'Élite des Hôtesses,{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Réservables en 1 Clic
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-light"
        >
          Collaborez avec les hôtesses et égéries les plus qualifiées. Profils certifiés, disponibilités synchronisées et paiements sous séquestre sécurisé.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#catalogue"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Explorer le Catalogue ({totalProfilesCount})
            <ArrowRight className="h-4 w-4" />
          </a>

          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
          >
            Portfolio 3D Interactif
          </Link>
        </motion.div>

        {/* Trust Social Proof Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 border-t border-white/10 pt-8"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Profils 100% Vérifiés</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Contrats & Factures Sécurisés</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Note Moyenne de 4.9/5</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
