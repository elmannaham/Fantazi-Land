"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KPICard } from "@/components/molecules/KPICard";
import { Card, CardBody } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { useProfiles } from "@/lib/hooks/useProfiles";

interface BookingItem {
  id: string;
  client_name?: string;
  project_title: string;
  start_date?: string;
  budget?: number;
  currency?: string;
  status: string;
}

export default function CreatorDashboardPage() {
  const { profiles, isLoading } = useProfiles();
  const activeProfile = profiles[0] || null;
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!activeProfile?.id) return;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        const res = await fetch(`/api/bookings?profileId=${activeProfile.id}`);
        if (res.ok) {
          const json = await res.json();
          setBookings(json.data || []);
        }
      } catch (err) {
        console.error("Erreur chargement bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    }

    loadBookings();
  }, [activeProfile?.id]);

  const score = activeProfile?.performance_stats?.avg_rating ? Number(activeProfile.performance_stats.avg_rating) : 5.0;
  const reviewCount = activeProfile?.performance_stats?.total_reviews || 0;
  const totalProjects = activeProfile?.performance_stats?.total_projects || bookings.length;

  const creatorKpis = [
    {
      label: "Réservations actives",
      value: String(bookings.length),
      icon: "📅",
      change: bookings.length > 0 ? "En cours de traitement" : "Aucune réservation en attente",
      changeType: "positive" as const,
    },
    {
      label: "Tarif moyen",
      value: activeProfile ? `${activeProfile.base_rate ?? 500} ${activeProfile.currency || "EUR"}` : "—",
      icon: "💰",
      change: "Par prestation",
      changeType: "neutral" as const,
    },
    {
      label: "Note moyenne",
      value: `${score.toFixed(1)}/5`,
      icon: "⭐",
      change: `${reviewCount} avis clients`,
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Bienvenue {activeProfile ? `, ${activeProfile.name}` : ""} ! 👋
          </h1>
          <p className="text-slate-600 text-sm">
            Voici un aperçu en direct de votre activité et de vos réservations
          </p>
        </div>
        {activeProfile && (
          <div className="flex gap-2">
            <Link href={`/profiles/${activeProfile.id}`}>
              <Button variant="secondary" size="sm">👁 Voir ma fiche publique</Button>
            </Link>
            <Link href={`/profile/${activeProfile.id}/edit`}>
              <Button size="sm">✏️ Modifier mon profil</Button>
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {creatorKpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Demandes de Réservations
          </h2>
          {loadingBookings ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 animate-pulse text-slate-400">
              Chargement des réservations...
            </div>
          ) : bookings.length === 0 ? (
            <Card className="shadow-sm border border-slate-100 p-8 text-center">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-bold text-slate-800 mb-1">Aucune réservation pour le moment</h3>
              <p className="text-slate-500 text-xs mb-4">
                Les demandes effectuées sur votre fiche apparaîtront instantanément ici.
              </p>
              {activeProfile && (
                <Link href={`/profiles/${activeProfile.id}`}>
                  <Button variant="outline" size="sm">Tester une réservation sur ma fiche</Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm border border-slate-100">
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {booking.client_name || "Client"}
                        </h3>
                        <p className="text-sm text-slate-600">{booking.project_title}</p>
                      </div>
                      <Badge
                        label={booking.status === "confirmed" ? "Confirmée" : "En attente"}
                        variant={booking.status === "confirmed" ? "success" : "warning"}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <div>
                        Budget : <strong className="text-purple-700 font-semibold">{booking.budget} {booking.currency || "EUR"}</strong>
                      </div>
                      {booking.start_date && (
                        <div>
                          Date : {new Date(booking.start_date).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-sm border border-slate-100">
            <CardBody className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Actions Rapides</h3>
              {activeProfile && (
                <Link href={`/profile/${activeProfile.id}/edit`} className="block">
                  <Button className="w-full">✏️ Éditer profil</Button>
                </Link>
              )}
              <Link href="/" className="block">
                <Button variant="secondary" className="w-full">
                  🌐 Explorer le catalogue
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Rating Summary */}
          <Card className="shadow-sm border border-slate-100">
            <CardBody className="text-center p-6">
              <h3 className="font-bold text-slate-900 mb-2 text-sm">Satisfaction & Note</h3>
              <div className="text-4xl font-extrabold text-yellow-500 mb-1">{score.toFixed(1)} ⭐</div>
              <p className="text-xs text-slate-500 mb-4">{reviewCount} avis clients enregistrés</p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(score / 5) * 100}%` }}></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
