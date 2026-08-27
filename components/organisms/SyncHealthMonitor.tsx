"use client";

import { Card, CardBody, CardHeader } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";

interface SyncEvent {
  id: string | number;
  type: "success" | "error" | "pending" | "warning";
  title: string;
  message: string;
  timestamp: string;
  source: "storage" | "database" | "api" | "webhook";
}

interface SyncHealthMonitorProps {
  events: SyncEvent[];
  isMonitoring?: boolean;
  lastSyncTime?: string;
  syncStatus?: "healthy" | "degraded" | "error";
}

const typeConfig = {
  success: { label: "Succès", variant: "success" as const, icon: "✓" },
  error: { label: "Erreur", variant: "error" as const, icon: "✕" },
  pending: { label: "En cours", variant: "warning" as const, icon: "⟳" },
  warning: { label: "Avertissement", variant: "warning" as const, icon: "!" },
};

const sourceColors: Record<string, string> = {
  storage: "bg-blue-100 text-blue-800",
  database: "bg-green-100 text-green-800",
  api: "bg-purple-100 text-purple-800",
  webhook: "bg-orange-100 text-orange-800",
};

export function SyncHealthMonitor({
  events,
  isMonitoring = false,
  lastSyncTime,
  syncStatus = "healthy",
}: SyncHealthMonitorProps) {
  const statusConfig = {
    healthy: { label: "✓ Sain", color: "bg-green-100 text-green-800" },
    degraded: { label: "⚠ Dégradé", color: "bg-yellow-100 text-yellow-800" },
    error: { label: "✕ Erreur", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[syncStatus];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Moniteur de Synchronisation</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.label}
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Succès</p>
            <p className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.type === "success").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Erreurs</p>
            <p className="text-2xl font-bold text-red-600">
              {events.filter((e) => e.type === "error").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => e.type === "pending").length}
            </p>
          </div>
        </div>

        {/* Monitoring Status */}
        <div className="flex items-center gap-2">
          {isMonitoring && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <p className="text-sm text-slate-600">
            {isMonitoring ? "Synchronisation en cours..." : "Synchronisation inactive"}
          </p>
          {lastSyncTime && (
            <p className="text-xs text-slate-500 ml-auto">
              Dernière sync: {lastSyncTime}
            </p>
          )}
        </div>

        {/* Recent Events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase">
            Événements récents
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Aucun événement
              </p>
            ) : (
              events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        label={typeConfig[event.type].label}
                        variant={typeConfig[event.type].variant}
                      />
                      <span
                        className={`text-xs px-2 py-1 rounded ${sourceColors[event.source]}`}
                      >
                        {event.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{event.timestamp}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mb-1">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-600">{event.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
