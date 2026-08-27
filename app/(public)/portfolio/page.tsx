"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Shuffle,
  Grid3X3,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Camera,
  Heart,
} from "lucide-react";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";
import { BUCKET_IMAGES, shuffleArray, BucketMediaItem } from "@/lib/bucket-media";

export default function GaleriePage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "3d">("grid");
  const [activeImages, setActiveImages] = useState<BucketMediaItem[]>(BUCKET_IMAGES);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Liste dynamique des filtres d'hôtesses disponibles
  const filterOptions = useMemo(() => {
    const uniqueKeys = Array.from(new Set(BUCKET_IMAGES.map((i) => i.profileKey).filter(Boolean)));
    const options = [
      { key: "all", label: "Toutes les photos", count: BUCKET_IMAGES.length },
      ...uniqueKeys.map((k) => ({
        key: k as string,
        label: (k as string).toUpperCase(),
        count: BUCKET_IMAGES.filter((i) => i.profileKey === k).length,
      })),
    ];
    return options;
  }, []);

  // Filtrer les images
  useEffect(() => {
    if (activeFilter === "all") {
      setActiveImages(BUCKET_IMAGES);
    } else {
      setActiveImages(BUCKET_IMAGES.filter((item) => item.profileKey === activeFilter));
    }
  }, [activeFilter]);

  // Mélanger aléatoirement
  const handleShuffle = () => {
    setActiveImages((prev) => shuffleArray(prev));
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Gestion de la navigation Lightbox au clavier
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < activeImages.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeImages.length - 1));
      }
    },
    [lightboxIndex, activeImages.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentLightboxImage = lightboxIndex !== null ? activeImages[lightboxIndex] : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentLightboxImage && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-purple-600/80 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                  {currentLightboxImage.profileKey}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Photo {lightboxIndex + 1} sur {activeImages.length}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeImages.length - 1));
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image display */}
            <motion.div
              key={currentLightboxImage.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentLightboxImage.url}
                alt={currentLightboxImage.title || "Photo Galerie"}
                className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
                <p className="text-sm font-semibold text-white">
                  {currentLightboxImage.title || `Hôtesse ${currentLightboxImage.profileKey?.toUpperCase()}`}
                </p>
              </div>
            </motion.div>

            {/* Navigation Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev < activeImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 pt-16 pb-10 px-4 text-center border-b border-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3.5 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30 mb-4">
            <Camera className="h-3.5 w-3.5 text-purple-300" />
            Galerie Photos du Bucket
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Galerie Photos Exclusive
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Découvrez l'ensemble des clichés et shootings réels de nos hôtesses avec affichage haute définition et ordre aléatoire.
          </p>

          {/* Controls Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 backdrop-blur-md">
              {filterOptions.map((opt) => {
                const isActive = activeFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setActiveFilter(opt.key)}
                    className={`relative rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {opt.label} ({opt.count})
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-800 hover:border-purple-500 hover:text-white transition shadow-sm active:scale-95"
              >
                <Shuffle className="h-3.5 w-3.5 text-purple-400" />
                Mélanger aléatoirement
              </button>

              <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                    viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Vue Grille"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                    viewMode === "3d" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title="Vue 3D Cylindrique"
                >
                  <Layers className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Container */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {viewMode === "3d" ? (
          /* 3D Cylinder Mode */
          <div className="rounded-3xl bg-slate-900/60 p-6 sm:p-10 border border-slate-800/80 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Mode 3D Interactif
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Faites glisser pour tourner le carrousel. Cliquez sur une photo pour l'agrandir.
              </p>
            </div>
            <ThreeDPhotoCarousel
              cards={activeImages.map((img) => img.url)}
              onImageClick={(url, idx) => setLightboxIndex(idx)}
            />
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {activeImages.map((image, index) => {
              const isLiked = !!likes[image.id];
              return (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/10 transition duration-300"
                >
                  {/* Photo */}
                  <img
                    src={image.url}
                    alt={image.title || "Photo"}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

                  {/* Top Bar on Hover */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition duration-300 z-10">
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                      {image.profileKey}
                    </span>

                    <button
                      onClick={(e) => toggleLike(image.id, e)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
                        isLiked ? "bg-pink-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
                      }`}
                      aria-label="Aimer"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  {/* Bottom Bar on Hover */}
                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition duration-300 z-10">
                    <p className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {image.title || `Shooting ${image.profileKey?.toUpperCase()}`}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-300">
                      🔍 Agrandir en HD
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
