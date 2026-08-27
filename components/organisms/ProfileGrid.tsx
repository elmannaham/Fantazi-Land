"use client";

import { Card, CardBody } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { Rating } from "@/components/atoms/Rating";
import Link from "next/link";

interface Profile {
  id: string | number;
  name: string;
  category: string;
  avatar?: string;
  avatar_url?: string | null;
  bio?: string | null;
  rating?: number;
  reviewCount?: number;
  baseRate?: number;
  base_rate?: number | null;
  currency?: string;
  location?: string;
  isVerified?: boolean;
  performance_stats?: {
    avg_rating?: number | null;
    total_reviews?: number;
    total_projects?: number;
  } | null;
}

interface ProfileGridProps {
  profiles: Profile[];
  isLoading?: boolean;
  onSelect?: (id: string | number) => void;
}

export function ProfileGrid({
  profiles,
  isLoading = false,
  onSelect,
}: ProfileGridProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-80 bg-slate-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-600 font-medium">Aucun profil disponible pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => {
        const avatarSrc = profile.avatar || profile.avatar_url || undefined;
        const rate = profile.baseRate ?? profile.base_rate ?? 500;
        const curr = profile.currency || "EUR";
        const score = profile.rating ?? Number(profile.performance_stats?.avg_rating ?? 5.0);
        const reviews = profile.reviewCount ?? profile.performance_stats?.total_reviews ?? 0;

        return (
          <Card key={profile.id} className="hover:shadow-lg transition-all duration-200">
            <CardBody className="flex flex-col h-full">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <Avatar
                  src={avatarSrc}
                  name={profile.name}
                  alt={profile.name}
                  size="lg"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900">{profile.name}</h3>
                  {profile.isVerified && (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">✓ Vérifié</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">{profile.category}</p>
                {profile.location && (
                  <p className="text-xs text-slate-500 mb-3">📍 {profile.location}</p>
                )}

                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {profile.bio || "Aucune biographie renseignée."}
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <Rating
                    score={score}
                    reviewCount={reviews}
                  />
                </div>

                {/* Price */}
                <div className="mb-4 p-3 bg-purple-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Tarif estimé</span>
                  <span className="text-base font-bold text-purple-700">
                    {rate} {curr}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-2 pt-2">
                <Link href={`/profiles/${profile.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full text-xs py-2">
                    Voir profil
                  </Button>
                </Link>
                <Button
                  className="flex-1 text-xs py-2"
                  onClick={() => onSelect?.(profile.id)}
                >
                  Réserver
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
