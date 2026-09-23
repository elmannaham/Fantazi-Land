"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Rating } from "@/components/atoms/Rating";
import { Button } from "@/components/atoms/Button";
import { Card, CardBody } from "@/components/atoms/Card";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { ProfileHero } from "@/components/sections/ProfileHero";
import { useProfile } from "@/lib/hooks/useProfiles";
import { generatePersonalizedBio } from "@/lib/utils/bio-generator";
import { useLoadableImages } from "@/lib/hooks/useLoadableImages";
import type { MediaAsset } from "@/lib/types";

const getAssetUrl = (asset: MediaAsset) => asset.file_url;
const NO_ASSETS: MediaAsset[] = [];

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, isLoading, error } = useProfile(id);
  // Toutes les photos restent référencées ; celles qui ne chargent pas sont masquées
  const galleryAssets = useLoadableImages(profile?.media_assets ?? NO_ASSETS, getAssetUrl);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientEmail: "",
    projectTitle: "",
    projectDescription: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setBookingStatus("submitting");
      setBookingError(null);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profile.id,
          client_name: bookingForm.clientName,
          client_email: bookingForm.clientEmail,
          project_title: bookingForm.projectTitle,
          project_description: bookingForm.projectDescription,
          start_date: bookingForm.startDate ? new Date(bookingForm.startDate).toISOString() : undefined,
          end_date: bookingForm.endDate ? new Date(bookingForm.endDate).toISOString() : undefined,
          budget: bookingForm.budget ? Number(bookingForm.budget) : profile.base_rate,
          currency: profile.currency || "EUR",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible d'enregistrer la réservation");
      }

      setBookingStatus("success");
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingStatus("idle");
        setBookingForm({
          clientName: "",
          clientEmail: "",
          projectTitle: "",
          projectDescription: "",
          startDate: "",
          endDate: "",
          budget: "",
        });
      }, 2000);
    } catch (err) {
      setBookingStatus("error");
      setBookingError(err instanceof Error ? err.message : "Erreur inattendue");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Profil introuvable</h1>
          <p className="text-slate-600 text-sm mb-6">{error || "Ce profil n'existe pas ou n'est plus disponible."}</p>
          <Link href="/">
            <Button className="w-full">Retour à l'accueil</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const avgRating = profile.performance_stats?.avg_rating ? Number(profile.performance_stats.avg_rating) : 5.0;
  const totalReviews = profile.performance_stats?.total_reviews || profile.reviews?.length || 0;
  const totalProjects = profile.performance_stats?.total_projects || 0;
  const baseRate = profile.base_rate ?? 500;
  const currency = profile.currency || "EUR";

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white text-2xl bg-white/20 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/40"
          >
            ✕
          </button>
          {selectedImage.endsWith(".mp4") ? (
            <video
              src={selectedImage}
              controls
              autoPlay
              className="max-h-[85vh] max-w-4xl rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="relative max-h-[85vh] max-w-4xl w-full h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                src={selectedImage}
                alt="Agrandie"
                fill
                priority
                sizes="90vw"
                className="object-contain rounded-2xl shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {isBookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsBookingOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Réserver avec {profile.name}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Tarif estimé : {baseRate} {currency}
            </p>

            {bookingStatus === "success" ? (
              <div className="p-6 text-center bg-emerald-50 text-emerald-800 rounded-xl">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="font-bold text-lg mb-1">Demande envoyée !</h3>
                <p className="text-sm">Votre réservation a bien été transmise à l'hôtesse.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg">
                    {bookingError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Email *</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="jean.dupont@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre du Projet *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.projectTitle}
                    onChange={(e) => setBookingForm({ ...bookingForm, projectTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Shooting photo lookbook automne"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Attentes</label>
                  <textarea
                    rows={3}
                    value={bookingForm.projectDescription}
                    onChange={(e) => setBookingForm({ ...bookingForm, projectDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Précisez le lieu, les livrables souhaités, le style..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Début</label>
                    <input
                      type="date"
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Fin</label>
                    <input
                      type="date"
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsBookingOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={bookingStatus === "submitting"}
                  >
                    {bookingStatus === "submitting" ? "Envoi..." : "Confirmer la demande"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hero personnalisé : photos, couleur d'accent et infos du profil */}
      <ProfileHero profile={profile} onBook={() => setIsBookingOpen(true)} />

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        {/* Bio */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">À propos de l'hôtesse</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.bio || generatePersonalizedBio({
              name: profile.name,
              category: profile.category,
              baseRate: profile.base_rate,
              currency: profile.currency || "EUR",
              avgRating: avgRating,
              totalProjects: totalProjects
            })}
          </p>
        </section>

        {/* Gallery / Media Assets */}
        {galleryAssets.length > 0 && (
          <section id="galerie" className="scroll-mt-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Portfolio & Galerie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryAssets.map((asset, idx) => {
                const isVideo = asset.file_type === "video" || asset.file_url.endsWith(".mp4");
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedImage(asset.file_url)}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-900 cursor-pointer group shadow-sm hover:shadow-md transition"
                  >
                    {isVideo ? (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg group-hover:scale-110 transition">
                          ▶
                        </div>
                      </div>
                    ) : (
                      <OptimizedImage
                        src={asset.file_url}
                        alt="Portfolio photo"
                        fill
                        priority={idx < 3}
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium text-xs gap-1 z-10">
                      {isVideo ? "▶ Lire la vidéo" : "🔍 Agrandir"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        {profile.reviews && profile.reviews.length > 0 && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Avis clients ({profile.reviews.length})</h2>
            <div className="space-y-4">
              {profile.reviews.map((rev) => (
                <Card key={rev.id} className="border border-slate-100 bg-slate-50/50">
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {rev.client_name || "Client vérifié"}
                      </span>
                      <Rating score={rev.rating} maxScore={5} />
                    </div>
                    {rev.comment && <p className="text-slate-600 text-sm">{rev.comment}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(rev.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Social Links */}
        {(profile.instagram_url || profile.tiktok_url || profile.twitter_url || profile.website_url) && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Réseaux Sociaux & Liens</h2>
            <div className="flex flex-wrap gap-3">
              {profile.instagram_url && (
                <Link
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 font-medium text-sm transition"
                >
                  📷 Instagram
                </Link>
              )}
              {profile.tiktok_url && (
                <Link
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 font-medium text-sm transition"
                >
                  🎵 TikTok
                </Link>
              )}
              {profile.twitter_url && (
                <Link
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl hover:bg-sky-100 font-medium text-sm transition"
                >
                  🐦 X / Twitter
                </Link>
              )}
              {profile.website_url && (
                <Link
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 font-medium text-sm transition"
                >
                  🌐 Site Web
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
