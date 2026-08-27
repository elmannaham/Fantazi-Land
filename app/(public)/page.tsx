"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProfileGrid } from "@/components/organisms/ProfileGrid";
import { useProfiles } from "@/lib/hooks/useProfiles";

export default function HomePage() {
  const { profiles, isLoading, error } = useProfiles();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-95"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Vue agrandie"
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 py-20 px-4 text-white shadow-md">
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="mb-3 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Plateforme Exclusive de Réservation
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Fantazi-Land
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90 sm:text-xl">
            Découvrez nos créatrices d'exception, explorez leurs portfolios exclusifs et réservez vos collaborations en toute sécurité.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/profiles/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-purple-700 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Créer un profil
            </Link>
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
            >
              Explorer les créatrices ({profiles.length})
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="catalogue" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Nos Créatrices Officielles
            </h2>
            <p className="mt-2 text-slate-600">
              Découvrez nos créatrices d'exception et réservez vos collaborations
            </p>
          </div>
          <span className="rounded-full bg-purple-100 px-3.5 py-1 text-sm font-semibold text-purple-800">
            {profiles.length} profils disponibles
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">Erreur: {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <ProfileGrid
            profiles={profiles.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              avatar: p.avatar_url || undefined,
              bio: p.bio || "",
              rating: p.performance_stats?.avg_rating ? Number(p.performance_stats.avg_rating) : 5,
              reviewCount: 0,
              baseRate: Number(p.base_rate) || 100,
              location: undefined,
              isVerified: false,
            }))}
            onSelect={(id) => {
              console.log("Booking profile:", id);
            }}
          />
        )}
      </section>
    </main>
  );
}
