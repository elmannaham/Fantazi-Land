"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";

interface ActivityEvent {
  id: string | number;
  type:
    | "sync_success"
    | "sync_error"
    | "user_created"
    | "user_updated"
    | "booking_created"
    | "booking_confirmed"
    | "review_posted"
    | "profile_imported"
    | "system_alert";
  title: string;
  description: string;
  actor?: {
    name: string;
    avatar?: string;
    role: "system" | "admin" | "user";
  };
  resource?: {
    type: "profile" | "booking" | "review" | "sync";
    id: string;
    name: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  metadata?: Record<string, any>;
  isRead?: boolean;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading?: boolean;
  onMarkRead?: (id: string | number) => void;
  onFilter?: (type: string) => void;
  selectedFilter?: string;
}

const typeConfig: Record<
  ActivityEvent["type"],
  { label: string; icon: string; color: string }
> = {
  sync_success: {
    label: "Sync Réussi",
    icon: "✓",
    color: "bg-green-100 text-green-800",
  },
  sync_error: {
    label: "Sync Erreur",
    icon: "✕",
    color: "bg-red-100 text-red-800",
  },
  user_created: {
    label: "Utilisateur Créé",
    icon: "+",
    color: "bg-blue-100 text-blue-800",
  },
  user_updated: {
    label: "Utilisateur Modifié",
    icon: "✎",
    color: "bg-blue-100 text-blue-800",
  },
  booking_created: {
    label: "Réservation Créée",
    icon: "📅",
    color: "bg-purple-100 text-purple-800",
  },
  booking_confirmed: {
    label: "Réservation Confirmée",
    icon: "✓✓",
    color: "bg-green-100 text-green-800",
  },
  review_posted: {
    label: "Avis Posté",
    icon: "⭐",
    color: "bg-yellow-100 text-yellow-800",
  },
  profile_imported: {
    label: "Profil Importé",
    icon: "📥",
    color: "bg-indigo-100 text-indigo-800",
  },
  system_alert: {
    label: "Alerte Système",
    icon: "⚠",
    color: "bg-orange-100 text-orange-800",
  },
};

const severityConfig: Record<
  ActivityEvent["severity"],
  { label: string; color: string }
> = {
  low: { label: "Faible", color: "bg-slate-100 text-slate-800" },
  medium: { label: "Moyen", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Élevé", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Critique", color: "bg-red-100 text-red-800" },
};

export function ActivityFeed({
  events,
  isLoading = false,
  onMarkRead,
  onFilter,
  selectedFilter,
}: ActivityFeedProps) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Get unique event types for filter buttons
  const eventTypes = Array.from(new Set(events.map((e) => e.type)));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const filteredEvents =
    selectedFilter && selectedFilter !== "all"
      ? events.filter((e) => e.type === selectedFilter)
      : events;

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedFilter === "all" || !selectedFilter ? "primary" : "secondary"}
          onClick={() => onFilter?.("all")}
        >
          Tous ({events.length})
        </Button>
        {eventTypes.map((type) => {
          const count = events.filter((e) => e.type === type).length;
          return (
            <Button
              key={type}
              size="sm"
              variant={selectedFilter === type ? "primary" : "secondary"}
              onClick={() => onFilter?.(type)}
            >
              {typeConfig[type].label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-slate-600">Aucun événement</p>
            </CardBody>
          </Card>
        ) : (
          filteredEvents.map((event, index) => (
            <div key={event.id}>
              {/* Timeline Connector */}
              {index < filteredEvents.length - 1 && (
                <div className="h-4 border-l-2 border-slate-200 ml-6" />
              )}

              <Card
                className={`cursor-pointer transition-all ${
                  !event.isRead ? "border-purple-300 bg-purple-50" : ""
                }`}
                hover={true}
              >
                <CardBody>
                  {/* Header Row */}
                  <div className="flex items-start gap-4">
                    {/* Timeline Dot */}
                    <div
                      className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                        event.severity === "critical"
                          ? "bg-red-500 animate-pulse"
                          : event.severity === "high"
                            ? "bg-orange-500"
                            : event.severity === "medium"
                              ? "bg-yellow-500"
                              : "bg-slate-300"
                      }`}
                    />

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded ${
                            typeConfig[event.type].color
                          }`}
                        >
                          {typeConfig[event.type].icon}{" "}
                          {typeConfig[event.type].label}
                        </span>
                        <Badge
                          label={severityConfig[event.severity].label}
                          variant={
                            event.severity === "critical"
                              ? "error"
                              : event.severity === "high"
                                ? "warning"
                                : event.severity === "medium"
                                  ? "info"
                                  : "default"
                          }
                        />
                        {!event.isRead && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        )}
                        <p className="text-xs text-slate-500 ml-auto">
                          {event.timestamp}
                        </p>
                      </div>

                      <h3 className="font-semibold text-slate-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {event.description}
                      </p>

                      {/* Actor & Resource */}
                      <div className="flex items-center gap-4 flex-wrap pb-3 border-b border-slate-100">
                        {event.actor && (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={event.actor.name}
                              alt={event.actor.name}
                              size="sm"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {event.actor.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {event.actor.role}
                              </p>
                            </div>
                          </div>
                        )}
                        {event.resource && (
                          <div className="text-xs">
                            <p className="text-slate-500">
                              Ressource:{" "}
                              <span className="font-semibold text-slate-900">
                                {event.resource.name}
                              </span>
                            </p>
                            <p className="text-slate-500">
                              Type: {event.resource.type}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expandable Metadata */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="pt-3">
                          <button
                            className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                            onClick={() =>
                              setExpandedId(
                                expandedId === event.id ? null : event.id
                              )
                            }
                          >
                            {expandedId === event.id ? "▼" : "▶"} Détails
                            techniques
                          </button>
                          {expandedId === event.id && (
                            <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded font-mono text-xs overflow-x-auto">
                              <pre>
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {!event.isRead && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onMarkRead?.(event.id)}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
