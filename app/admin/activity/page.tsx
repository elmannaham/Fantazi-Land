"use client";

import { useState } from "react";
import { ActivityFeed } from "@/components/organisms/ActivityFeed";
import { Card, CardHeader, CardBody } from "@/components/atoms/Card";

const mockActivityEvents = [
  {
    id: "1",
    type: "sync_success" as const,
    title: "Synchronisation Storage → DB Réussie",
    description:
      "Profil 'Marie Dupont' synchronisé avec succès depuis le stockage cloud.",
    actor: { name: "Système", role: "system" as const },
    resource: {
      type: "profile" as const,
      id: "prof_123",
      name: "Marie Dupont - Photographe",
    },
    severity: "low" as const,
    timestamp: "Il y a 2 min",
    metadata: {
      source: "storage-webhook",
      duration_ms: 245,
      rows_processed: 1,
      destination: "profiles table",
    },
    isRead: false,
  },
  {
    id: "2",
    type: "booking_confirmed" as const,
    title: "Réservation Confirmée",
    description:
      "La réservation #BK-2024-5432 a été confirmée par Marie Dupont.",
    actor: { name: "Marie Dupont", role: "user" as const },
    resource: {
      type: "booking" as const,
      id: "bk_5432",
      name: "Séance photo - 25 Sept 2026",
    },
    severity: "low" as const,
    timestamp: "Il y a 15 min",
    metadata: {
      booking_amount: "€250",
      client: "Jean Martin",
      confirmed_at: "2026-08-26T14:30:00Z",
    },
    isRead: true,
  },
  {
    id: "3",
    type: "sync_error" as const,
    title: "Erreur de Synchronisation",
    description:
      "Échec de l'import CSV: validation échouée sur 3 lignes. Envoyé en DLQ.",
    actor: { name: "Système", role: "system" as const },
    resource: {
      type: "sync" as const,
      id: "sync_7891",
      name: "batch-import-20260826.csv",
    },
    severity: "high" as const,
    timestamp: "Il y a 1 h",
    metadata: {
      error_count: 3,
      total_rows: 45,
      failed_rows: [12, 23, 34],
      reason: "Email format invalid",
      retry_count: 0,
    },
    isRead: false,
  },
  {
    id: "4",
    type: "review_posted" as const,
    title: "Nouvel Avis Reçu",
    description:
      "Sophie Martin a laissé un avis 5★ pour Marie Dupont avec le commentaire: 'Excellente photographe, très professionnelle!'",
    actor: { name: "Sophie Martin", role: "user" as const },
    resource: {
      type: "review" as const,
      id: "rev_9912",
      name: "Avis - Séance photo",
    },
    severity: "low" as const,
    timestamp: "Il y a 3 h",
    metadata: {
      rating: 5,
      service: "Photographe",
      reviewer_id: "user_456",
    },
    isRead: true,
  },
  {
    id: "5",
    type: "profile_imported" as const,
    title: "Profil Créé via Formulaire",
    description: "Nouveau profil créé pour 'Luc Fontaine - Vidéographe'",
    actor: { name: "Admin Panel", role: "admin" as const },
    resource: {
      type: "profile" as const,
      id: "prof_789",
      name: "Luc Fontaine - Vidéographe",
    },
    severity: "low" as const,
    timestamp: "Il y a 5 h",
    metadata: {
      category: "Vidéographe",
      location: "Lyon",
      base_rate: 150,
      is_verified: false,
    },
    isRead: true,
  },
  {
    id: "6",
    type: "system_alert" as const,
    title: "Alerte Santé Système",
    description:
      "Latence Base44 API élevée: 2500ms (seuil: 1000ms). Continuez à surveiller.",
    actor: { name: "Système", role: "system" as const },
    severity: "medium" as const,
    timestamp: "Il y a 8 h",
    metadata: {
      metric: "base44_api_latency",
      value_ms: 2500,
      threshold_ms: 1000,
      status: "warning",
    },
    isRead: true,
  },
  {
    id: "7",
    type: "user_created" as const,
    title: "Nouvel Utilisateur Inscrit",
    description: "Thomas Blanc s'est inscrit en tant que créateur de contenu",
    actor: { name: "Thomas Blanc", role: "user" as const },
    severity: "low" as const,
    timestamp: "Il y a 12 h",
    metadata: {
      user_id: "user_999",
      email: "thomas@example.com",
      account_type: "creator",
      signup_method: "email",
    },
    isRead: true,
  },
  {
    id: "8",
    type: "sync_error" as const,
    title: "Webhook Timeout",
    description:
      "Webhook Storage→DB timeout après 30s. Réessai programmé dans 5 min.",
    actor: { name: "Système", role: "system" as const },
    severity: "critical" as const,
    timestamp: "Il y a 20 h",
    metadata: {
      webhook_id: "wh_storage_123",
      timeout_seconds: 30,
      retry_scheduled: "2026-08-26T20:05:00Z",
      attempt: 1,
      max_retries: 3,
    },
    isRead: false,
  },
];

export default function AdminActivityPage() {
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();
  const [events, setEvents] = useState(mockActivityEvents);

  const handleMarkRead = (id: string | number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
  };

  const unreadCount = events.filter((e) => !e.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Flux d'Activité
        </h1>
        <p className="text-slate-600">
          Surveillez tous les événements système, syncs, réservations et
          activités utilisateur
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500 mb-1">Non Lus</p>
            <p className="text-3xl font-bold text-purple-600">{unreadCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500 mb-1">Erreurs Actives</p>
            <p className="text-3xl font-bold text-red-600">
              {events.filter((e) => e.severity === "critical").length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500 mb-1">Total Événements</p>
            <p className="text-3xl font-bold text-slate-900">
              {events.length}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <h2 className="font-bold text-slate-900">Événements Récents</h2>
        </CardHeader>
        <CardBody>
          <ActivityFeed
            events={events}
            selectedFilter={selectedFilter}
            onFilter={setSelectedFilter}
            onMarkRead={handleMarkRead}
          />
        </CardBody>
      </Card>
    </div>
  );
}
