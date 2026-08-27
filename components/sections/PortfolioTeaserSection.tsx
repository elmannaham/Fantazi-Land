"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Sparkles, Image, Compass } from "lucide-react";

export function PortfolioTeaserSection() {
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
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-purple-900 shadow-xl transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                Explorer la Galerie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase Box */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md space-y-4"
          >
            <div className="flex items-center justify-between text-xs text-purple-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <Compass className="h-4 w-4 text-pink-400" /> Navigation 360°
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                Temps Réel
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="aspect-square rounded-xl bg-purple-950/60 border border-purple-500/30 flex flex-col items-center justify-center p-2 text-center">
                <Sparkles className="h-5 w-5 text-purple-400 mb-1" />
                <span className="text-[10px] font-bold">Rendu 60 FPS</span>
              </div>
              <div className="aspect-square rounded-xl bg-purple-950/60 border border-purple-500/30 flex flex-col items-center justify-center p-2 text-center">
                <Image className="h-5 w-5 text-pink-400 mb-1" />
                <span className="text-[10px] font-bold">Lightbox HD</span>
              </div>
              <div className="aspect-square rounded-xl bg-purple-950/60 border border-purple-500/30 flex flex-col items-center justify-center p-2 text-center">
                <Layers className="h-5 w-5 text-amber-400 mb-1" />
                <span className="text-[10px] font-bold">Multi-Angles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
