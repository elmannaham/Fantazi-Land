"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";
import { Button } from "@/components/atoms/Button";
import { useProfiles } from "@/lib/hooks/useProfiles";

// Fallback images si aucun media_asset disponible
const fallbackImages: Record<string, string[]> = {
  "marie-dupont": [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511527260815-7a02b99a3b10?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  ],
  "luc-fontaine": [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516035069371-29ad0ced3438?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526680527885-dc3a255edb04?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1498940336284-d7e3e40d5f94?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop",
  ],
  "sophie-laurent": [
    "https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1495887496540-8d3b26eba8f5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1491622860651-119477b4b6b9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494074871229-ff53de54db16?w=400&h=400&fit=crop",
  ],
};

export default function PortfolioPage() {
  const { profiles, isLoading, error } = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [profilesWithMedia, setProfilesWithMedia] = useState<any[]>([]);

  // Charger les images depuis Prisma/Supabase
  useEffect(() => {
    const loadProfilesWithMedia = async () => {
      try {
        const response = await fetch("/api/profiles?include=media_assets");
        const data = await response.json();
        setProfilesWithMedia(data.profiles || data || []);
      } catch (err) {
        console.error("Erreur chargement médias:", err);
        setProfilesWithMedia(profiles);
      }
    };

    if (profiles.length > 0) {
      loadProfilesWithMedia();
    }
  }, [profiles]);

  const activeProfile = selectedProfile
    ? profilesWithMedia.find((p) => p.id === selectedProfile)
    : profilesWithMedia[0];

  const getPortfolioImages = (profileId: string): string[] => {
    const profile = profilesWithMedia.find((p) => p.id === profileId);

    // Récupérer les images réelles depuis media_assets
    if (profile && profile.media_assets && profile.media_assets.length > 0) {
      return profile.media_assets.map((asset: any) => asset.file_url);
    }

    // Fallback aux images mockées
    const key = profile?.name?.toLowerCase().replace(/\s+/g, "-") || "";
    return (
      fallbackImages[key] || [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1495887496540-8d3b26eba8f5?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1511527260815-7a02b99a3b10?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1497438262192-87b94efad6e7?w=400&h=400&fit=crop",
      ]
    );
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <p className="text-slate-600">Chargement du portfolio...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-20">
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Portfolio 3D</h1>
          <p className="text-lg opacity-90">
            Découvrez les books et profils de nos hôtesses en 3D interactif
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile List */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Hôtesses
              </h2>
              <div className="space-y-2 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                {profilesWithMedia.length > 0 ? (
                  profilesWithMedia.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedProfile === profile.id || (!selectedProfile && profilesWithMedia[0]?.id === profile.id)
                          ? "bg-purple-600 text-white"
                          : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-semibold">{profile.name}</div>
                      <div className="text-sm opacity-75">{profile.category}</div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">Chargement des hôtesses...</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Carousel */}
          <div className="lg:col-span-3">
            {activeProfile && (
              <div className="space-y-8">
                {/* Profile Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {activeProfile.name}
                  </h2>
                  <p className="text-slate-600 mb-4">
                    {activeProfile.category}
                  </p>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {activeProfile.bio}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/profiles/${activeProfile.id}`}>
                      <Button>Voir le profil complet</Button>
                    </Link>
                    <Button variant="secondary">Réserver</Button>
                  </div>
                </div>

                {/* 3D Carousel */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Portfolio (3D Interactif)
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    💡 Conseil: Cliquez et glissez pour faire tourner le carrousel. Cliquez sur une image pour l'agrandir.
                  </p>
                  <ThreeDPhotoCarousel
                    cards={getPortfolioImages(activeProfile.id)}
                    onImageClick={(imgUrl, index) => {
                      setSelectedImage(imgUrl);
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {activeProfile.performance_stats?.total_projects || 0}
                    </div>
                    <p className="text-slate-600 text-sm">Projets complétés</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {activeProfile.performance_stats?.avg_rating
                        ? Number(activeProfile.performance_stats.avg_rating).toFixed(1)
                        : "5"}
                      ★
                    </div>
                    <p className="text-slate-600 text-sm">
                      {activeProfile.performance_stats?.total_reviews || 0} avis
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      €{Number(activeProfile.base_rate || 100)}
                    </div>
                    <p className="text-slate-600 text-sm">Tarif de base/heure</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
