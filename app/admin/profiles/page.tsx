"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/atoms/Card";
import { Badge, StatusBadge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import type { ProfileWithStats } from "@/lib/types";

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/profiles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible de charger les profils");
      }
      setProfiles(Array.isArray(json.data) ? json.data : json.profiles || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfiles();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProfiles]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le profil de "${name}" ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de la suppression");
      }
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
              ← Dashboard Admin
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-bold text-purple-600">Gestion des Profils</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/api/profiles/import-csv">
              <Button variant="outline" size="sm">📥 Importer CSV</Button>
            </Link>
            <Link href="/profiles/create">
              <Button size="sm">➕ Créer profil</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <Card className="mb-6 shadow-sm border border-slate-100">
          <CardBody>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recherche par nom</label>
                <input
                  type="text"
                  placeholder="Rechercher une créatrice..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catégorie</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">Toutes catégories</option>
                  <option value="Photographie">Photographie</option>
                  <option value="Vidéographie">Vidéographie</option>
                  <option value="Contenu Mode">Contenu Mode</option>
                  <option value="Beauté">Beauté</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <Card className="shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Créatrice
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tarif
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Note / Avis
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Base44 ID
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Chargement des profils...
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Aucun profil ne correspond aux critères de recherche.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => {
                    const rate = profile.base_rate ?? 500;
                    const curr = profile.currency || "EUR";
                    const score = profile.performance_stats?.avg_rating ? Number(profile.performance_stats.avg_rating) : 5.0;
                    const reviews = profile.performance_stats?.total_reviews ?? profile.reviews?.length ?? 0;

                    return (
                      <tr
                        key={profile.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
                              ) : (
                                profile.name[0]?.toUpperCase() || "?"
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{profile.name}</div>
                              <div className="text-xs text-slate-400">ID: {profile.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge label={profile.category} />
                        </td>
                        <td className="px-6 py-4 font-semibold text-purple-700">
                          {rate} {curr}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="text-yellow-500 font-bold">★ {score.toFixed(1)}</span>
                          <span className="text-xs text-slate-400 ml-1">({reviews} avis)</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {profile.storage_folder_id || (profile as any).base44_user_id || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/profiles/${profile.id}`}>
                              <button
                                title="Voir la fiche publique"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition"
                              >
                                👁
                              </button>
                            </Link>
                            <button
                              title="Supprimer"
                              onClick={() => handleDelete(profile.id, profile.name)}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="border-t border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50 text-xs text-slate-500">
            <div>
              Total : <strong className="text-slate-800">{profiles.length}</strong> profils chargés
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
