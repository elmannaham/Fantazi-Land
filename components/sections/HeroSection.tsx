"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  totalProfilesCount: number;
  onExploreClick?: () => void;
}

export function HeroSection({
  totalProfilesCount,
  onExploreClick,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-20 text-center sm:py-28"
      style={{
        background: "radial-gradient(ellipse 80% 70% at 50% 40%, #121523 0%, #0a0b14 70%, #07080f 100%)",
        color: "#ffffff",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[20%] -translate-x-1/2 -z-0"
        style={{
          width: "600px",
          height: "400px",
          background: "radial-gradient(circle, rgba(230, 92, 159, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[920px] flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full px-[18px] py-2 text-[14px] font-medium tracking-[0.01em] text-[#d0d1d9] mb-8"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="text-[14px] leading-none text-[#fddc6d]">✧</span>
          <span>Plateforme Exclusive de Réservation & Booking</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="font-extrabold tracking-[-0.02em] leading-[1.15] mb-7 max-w-[900px] text-4xl sm:text-6xl md:text-[64px]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #ffffff 0%, #e65c9f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            L'Élite des Hôtesses,
          </span>
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #e65c9f 0%, #fddc6d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Réservables
          </span>
          <span
            style={{
              color: "#fddc6d",
              background: "linear-gradient(90deg, #fddc6d, #fddc6d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {" "}en 1 Clic
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-base sm:text-lg leading-[1.6] text-[#d0d1d9] max-w-[620px] mb-12 font-normal"
        >
          Collaborez avec les hôtesses et égéries les plus qualifiées.
          Profils certifiés, disponibilités synchronisées et paiements sous séquestre sécurisé.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto"
        >
          <a
            href="#catalogue"
            onClick={onExploreClick}
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xl"
            style={{
              background: "linear-gradient(90deg, #e65c9f 0%, #b156e6 100%)",
              boxShadow: "0 8px 24px rgba(230, 92, 159, 0.35), 0 4px 12px rgba(177, 86, 230, 0.2)",
            }}
          >
            Explorer le Catalogue ({totalProfilesCount})
            <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>

          <Link
            href="/portfolio"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-semibold tracking-[0.01em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#32364a] hover:border-white active:scale-95"
            style={{
              backgroundColor: "#2a2d3a",
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
            Galerie Photos HD
          </Link>
        </motion.div>

        {/* Trust Social Proof Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 border-t border-white/10 pt-8 w-full"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#e65c9f]" />
            <span>Profils 100% Vérifiés</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Contrats & Factures Sécurisés</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-[#fddc6d] text-[#fddc6d]" />
            <span>Note Moyenne de 4.9/5</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
