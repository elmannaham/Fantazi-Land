"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useProfiles } from "@/lib/hooks/useProfiles";
import { ProfileGrid } from "@/components/organisms/ProfileGrid";
import { BentoCreatorGrid } from "@/components/organisms/BentoCreatorGrid";
import { BookingModal } from "@/components/organisms/BookingModal";
import { CategoryFilterBar } from "@/components/molecules/CategoryFilterBar";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { PortfolioTeaserSection } from "@/components/sections/PortfolioTeaserSection";
import type { ProfileWithStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Tous",
  "Intime Rencontre",
  "Vidéographie",
  "Dinner & Show",
  "Contenu Mode",
  "Lifestylee",
];

export default function HomePage() {
  const { profiles, isLoading, error } = useProfiles();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingCreator, setSelectedBookingCreator] = useState<ProfileWithStats | null>(null);

  // Calcul dynamique des compteurs par catégorie
  const countMap = useMemo(() => {
    const map: Record<string, number> = { Tous: profiles.length };
    profiles.forEach((p) => {
      if (p.category) {
        map[p.category] = (map[p.category] || 0) + 1;
      }
    });
    return map;
  }, [profiles]);

  // Filtrage combiné (Catégorie + Recherche textuelle)
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchCategory =
        selectedCategory === "Tous" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [profiles, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-purple-500 selection:text-white">
      {/* 1. Hero Section 21st.dev Style */}
      <HeroSection
        totalProfilesCount={profiles.length}
        onExploreClick={() => {
          const el = document.getElementById("catalogue");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2. Bento Grid : Hôtesses Vedettes */}
        {!isLoading && profiles.length > 0 && (
          <BentoCreatorGrid
            creators={profiles}
            onBookCreator={(creator) => setSelectedBookingCreator(creator)}
          />
        )}

        {/* 3. Section Catalogue & Filtres */}
        <section id="catalogue" className="py-12 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800 mb-2">
                <Sparkles className="h-3 w-3" />
                Catalogue Officiel
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Nos Hôtesses d'Exception
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Explorez les profils vérifiés, consultez les tarifs et réservez en direct.
              </p>
            </div>

            {/* Barre de Recherche */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition"
              />
            </div>
          </div>

          {/* Barre de filtres par catégorie */}
          <div className="mb-8">
            <CategoryFilterBar
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              countMap={countMap}
            />
          </div>

          {/* Message d'erreur éventuel */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center mb-8">
              <p className="text-sm font-semibold text-red-700">Erreur : {error}</p>
            </div>
          )}

          {/* Grille des profils */}
          <ProfileGrid
            profiles={filteredProfiles}
            isLoading={isLoading}
            onBookCreator={(creator) => setSelectedBookingCreator(creator)}
          />
        </section>
      </div>

      {/* 4. Portfolio 3D Teaser Section */}
      <PortfolioTeaserSection />

      {/* 5. Section Métriques & Réassurance */}
      <StatsSection />

      {/* Modal de Réservation Interactive */}
      {selectedBookingCreator && (
        <BookingModal
          isOpen={Boolean(selectedBookingCreator)}
          onClose={() => setSelectedBookingCreator(null)}
          creator={{
            id: selectedBookingCreator.id,
            name: selectedBookingCreator.name,
            baseRate: selectedBookingCreator.base_rate,
            currency: selectedBookingCreator.currency,
            category: selectedBookingCreator.category,
            avatarUrl: selectedBookingCreator.avatar_url,
          }}
        />
      )}
    </main>
  );
}
