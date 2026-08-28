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
import { OptimizedImage } from "@/components/atoms/OptimizedImage";

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

  // Navigation Lightbox au clavier
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
                <span className="text-sm font-medium text-slate-300">
                  {currentLightboxImage.title || `Photo ${lightboxIndex + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-2">
                  {lightboxIndex + 1} / {activeImages.length}
                </span>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activeImages.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 transition z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev < activeImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 transition z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Main Image in Lightbox */}
            <div
              className="relative max-h-[82vh] max-w-5xl w-full h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                src={currentLightboxImage.url}
                alt={currentLightboxImage.title || "Photo Shooting"}
                fill
                priority
                sizes="100vw"
                className="object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-purple-950/50 to-transparent pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3.5 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30 backdrop-blur-md mb-3">
                <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
                Live Supabase Storage Gallery
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Galerie <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Exclusive</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
                Explorez l'intégralité des photos et books synchronisés depuis le bucket <code className="text-purple-300 font-mono">HOTESS</code>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShuffle}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white border border-white/15 backdrop-blur-md hover:bg-white/20 active:scale-95 transition"
              >
                <Shuffle className="h-4 w-4 text-purple-400" />
                Mélanger l'ordre
              </button>

              <div className="flex rounded-2xl bg-white/10 p-1 border border-white/15 backdrop-blur-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    viewMode === "grid" ? "bg-purple-600 text-white shadow-md" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Grille
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
                    viewMode === "3d" ? "bg-purple-600 text-white shadow-md" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  3D Cylindre
                </button>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActiveFilter(opt.key)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeFilter === opt.key
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        {viewMode === "3d" ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Expérience 3D Interactive (Glissez pour tourner)
              </span>
            </div>
            <div className="relative h-[550px] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <ThreeDPhotoCarousel
                cards={activeImages.map((img) => img.url)}
                onImageClick={(url, idx) => setLightboxIndex(idx)}
                autoRotate
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeImages.map((image, index) => {
              const isLiked = !!likes[image.id];
              const isPriority = index < 6;

              return (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-lg cursor-pointer hover:border-purple-500/50 hover:shadow-purple-500/10 transition duration-300"
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.title || "Photo"}
                    fill
                    priority={isPriority}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  {/* Top profile tag */}
                  <div className="absolute top-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-purple-300 backdrop-blur-md uppercase tracking-wider">
                      {image.profileKey}
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(image.id, e)}
                    className={`absolute top-2.5 right-2.5 z-20 rounded-full p-1.5 transition duration-200 ${
                      isLiked ? "bg-pink-600 text-white" : "bg-black/40 text-white hover:bg-pink-600 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-white" : ""}`} />
                  </button>

                  {/* Bottom caption */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs font-semibold text-white truncate">
                      {image.title || "Shooting photo"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
