"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { useProfile } from "@/lib/hooks/useProfiles";

export default function ProfileEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { profile, isLoading, error } = useProfile(params.id);

  const [formData, setFormData] = useState({
    name: "",
    category: "Photographie",
    bio: "",
    base_rate: 500,
    currency: "EUR",
    avatar_url: "",
    instagram: "",
    tiktok: "",
    twitter: "",
    website: "",
    is_available: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        category: profile.category || "Photographie",
        bio: profile.bio || "",
        base_rate: profile.base_rate ?? 500,
        currency: profile.currency || "EUR",
        avatar_url: profile.avatar_url || "",
        instagram: profile.instagram_url || "",
        tiktok: profile.tiktok_url || "",
        twitter: profile.twitter_url || "",
        website: profile.website_url || "",
        is_available: profile.is_available ?? true,
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus("saving");
      setSaveMessage(null);

      const res = await fetch(`/api/profiles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          bio: formData.bio,
          baseRate: formData.base_rate,
          currency: formData.currency,
          avatarUrl: formData.avatar_url,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          twitter: formData.twitter,
          website: formData.website,
          isAvailable: formData.is_available,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur lors de la sauvegarde");
      }

      setSaveStatus("success");
      setSaveMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage(err instanceof Error ? err.message : "Erreur inattendue");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce profil ? Cette action est irréversible.")) {
      return;
    }

    try {
      const res = await fetch(`/api/profiles/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Profil supprimé.");
        router.push("/admin/profiles");
      }
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center">
        <Card>
          <CardBody className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Profil non trouvé</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <Link href="/admin/profiles">
              <Button>Retour aux profils</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={`/profiles/${params.id}`} className="text-xs text-purple-600 hover:underline font-medium mb-1 block">
            ← Voir la fiche publique
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Éditer le profil</h1>
          <p className="text-slate-600 text-sm">
            Mettez à jour les informations, tarifs et liens sociaux
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/profiles">
            <Button variant="secondary" type="button">Annuler</Button>
          </Link>
          <Button type="submit" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Sauvegarde..." : "💾 Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Notification */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            saveStatus === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Form Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar - Avatar */}
        <div>
          <Card className="shadow-sm border border-slate-100">
            <CardBody className="text-center">
              <h2 className="font-bold text-slate-900 mb-4">Photo de profil</h2>

              <div className="flex justify-center mb-4">
                <Avatar
                  src={formData.avatar_url || undefined}
                  name={formData.name || "Aperçu"}
                  alt="Profile"
                  size="xl"
                />
              </div>

              <div className="text-left space-y-3">
                <label className="block text-xs font-semibold text-slate-700">URL de l'avatar</label>
                <input
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 text-left">
                <p className="text-xs text-purple-900 leading-relaxed">
                  💡 <strong>Conseil :</strong> Une image de haute qualité augmente le taux de réservation de 40%.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-sm border border-slate-100">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-base">Informations Générales</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de scène / Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Photographie">Photographie</option>
                    <option value="Vidéographie">Vidéographie</option>
                    <option value="Contenu Mode">Contenu Mode</option>
                    <option value="Beauté">Beauté</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biographie *
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </CardBody>
          </Card>

          {/* Pricing */}
          <Card className="shadow-sm border border-slate-100">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-base">Tarification</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarif de base *
                  </label>
                  <input
                    type="number"
                    required
                    name="base_rate"
                    value={formData.base_rate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Devise
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Social Media */}
          <Card className="shadow-sm border border-slate-100">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-base">Réseaux Sociaux & Liens</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    TikTok URL
                  </label>
                  <input
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Twitter / X URL
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://x.com/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Site Web URL
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://mon-site.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="border-rose-200 shadow-sm">
            <CardBody className="bg-rose-50/50 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-rose-900 text-sm">Supprimer définitivement ce profil</h3>
                <p className="text-xs text-rose-700">
                  Cette action supprimera le profil, son historique et ses liaisons Base44.
                </p>
              </div>
              <Button variant="danger" type="button" onClick={handleDelete} size="sm">
                Supprimer le profil
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </form>
  );
}
