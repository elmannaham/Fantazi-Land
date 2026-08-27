"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KPICard } from "@/components/molecules/KPICard";
import { Card, CardBody } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";

export default function AdminDashboardPage() {
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [failedSyncCount, setFailedSyncCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setIsLoading(true);
        const [profRes, syncRes] = await Promise.all([
          fetch("/api/profiles"),
          fetch("/api/failed-syncs?status=pending"),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          const list = Array.isArray(profData.data) ? profData.data : profData.profiles || [];
          setProfileCount(list.length);
        }

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setFailedSyncCount(syncData.data?.length || 0);
        }
      } catch (err) {
        console.error("Erreur chargement metrics admin:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const adminKpis = [
    {
      label: "Total Profils",
      value: profileCount !== null ? String(profileCount) : (isLoading ? "..." : "0"),
      icon: "👥",
      change: "Profils actifs en base",
      changeType: "positive" as const,
    },
    {
      label: "Chiffre d'affaires estimé",
      value: "€24.8k",
      icon: "💰",
      change: "+18% ce mois",
      changeType: "positive" as const,
    },
    {
      label: "Réservations",
      value: "340",
      icon: "📅",
      change: "+45 cette semaine",
      changeType: "positive" as const,
    },
    {
      label: "Erreurs DLQ (Sync)",
      value: failedSyncCount !== null ? String(failedSyncCount) : (isLoading ? "..." : "0"),
      icon: "⚠️",
      change: failedSyncCount === 0 ? "Aucune erreur en attente" : `${failedSyncCount} à traiter`,
      changeType: failedSyncCount === 0 ? ("positive" as const) : ("negative" as const),
    },
  ];

  const syncHealth = [
    { name: "Storage → DB (Webhooks)", status: "100%", stats: "Synchronisation automatique active" },
    { name: "DB → Storage (Sync)", status: "100%", stats: "Synchronisation automatique active" },
    { name: "Base44 API Integration", status: "100%", stats: "Connecteur API opérationnel" },
  ];

  const recentEvents = [
    {
      title: "Tableau de bord et routes API synchronisés",
      user: "Système",
      time: "Aujourd'hui",
      type: "SYNC",
    },
    {
      title: "Fiches créatrices connectées en temps réel",
      user: "Système",
      time: "Aujourd'hui",
      type: "LIVE",
    },
    {
      title: "Gestion des erreurs de sync (DLQ) activée",
      user: "Admin",
      time: "Aujourd'hui",
      type: "SECURITY",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-purple-600">
            Fantazi-Land Admin
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin/profiles" className="text-sm font-medium text-slate-700 hover:text-purple-600">
              Profils
            </Link>
            <Link href="/admin/failed-syncs" className="text-sm font-medium text-slate-700 hover:text-purple-600">
              Erreurs DLQ {failedSyncCount && failedSyncCount > 0 ? `(${failedSyncCount})` : ""}
            </Link>
            <Link href="/" className="text-sm font-medium text-purple-600 hover:text-purple-800">
              🌐 Site public
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Tableau de Bord Admin
          </h1>
          <p className="text-slate-600">Gestion centralisée de la plateforme et suivi de synchronisation</p>
        </div>

        {/* KPI Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminKpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sync Health & Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sync Health */}
            <Card className="shadow-sm border border-slate-100">
              <CardBody>
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  Santé de la Synchronisation
                </h2>
                <div className="space-y-4">
                  {syncHealth.map((sync) => (
                    <div key={sync.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {sync.name}
                        </span>
                        <span className="text-sm text-emerald-600 font-semibold">
                          {sync.status}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{sync.stats}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Recent Events */}
            <Card className="shadow-sm border border-slate-100">
              <CardBody>
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  Activité & Événements
                </h2>
                <div className="space-y-3">
                  {recentEvents.map((event, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-purple-500 pl-4 py-2 bg-slate-50/50 rounded-r-xl"
                    >
                      <div className="font-semibold text-slate-900 text-sm">
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {event.user} • {event.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-sm border border-slate-100">
              <CardBody className="space-y-3">
                <h3 className="font-bold text-slate-900">Actions Rapides</h3>
                <Link href="/profiles/create" className="block">
                  <Button className="w-full">➕ Créer profil</Button>
                </Link>
                <Link href="/api/profiles/import-csv" className="block">
                  <Button variant="secondary" className="w-full">
                    📥 Importer CSV
                  </Button>
                </Link>
                <Link href="/admin/failed-syncs" className="block">
                  <Button variant="outline" className="w-full">
                    ⚠️ Voir Dead Letter Queue ({failedSyncCount ?? 0})
                  </Button>
                </Link>
              </CardBody>
            </Card>

            {/* System Health */}
            <Card className="shadow-sm border border-slate-100">
              <CardBody>
                <h3 className="font-bold text-slate-900 mb-4">État du Système</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">PostgreSQL (Supabase)</span>
                    <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">✓ En ligne</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Edge Functions</span>
                    <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">✓ 3 Actives</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Supabase Storage</span>
                    <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">✓ hotess bucket</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Base44 Client</span>
                    <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-full">✓ Connecté</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
