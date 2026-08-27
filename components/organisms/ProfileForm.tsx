"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";

interface ProfileFormProps {
  initialData?: {
    firstName: string;
    lastName: string;
    category: string;
    bio: string;
    location: string;
    baseRate: number;
    currency: string;
    instagram: string;
    tiktok: string;
    website: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({
  initialData = {
    firstName: "",
    lastName: "",
    category: "Photographe",
    bio: "",
    location: "",
    baseRate: 0,
    currency: "EUR",
    instagram: "",
    tiktok: "",
    website: "",
  },
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Avatar Section */}
        <div>
          <Card>
            <CardBody>
              <h2 className="font-bold text-slate-900 mb-4">Photo de profil</h2>

              <Avatar
                name={`${formData.firstName} ${formData.lastName}`}
                alt="Profile"
                size="xl"
              />

              <div className="mt-4 space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                >
                  📤 Changer la photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                >
                  Supprimer
                </Button>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-900">
                  <strong>Conseil:</strong> Utilisez une photo claire et
                  professionnelle pour augmenter vos réservations.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-slate-900">Informations de Base</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Photographe</option>
                  <option>Influenceur</option>
                  <option>Vidéographe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.bio.length}/500 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </CardBody>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-slate-900">Tarification</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tarif de base (€/heure) *
                </label>
                <input
                  type="number"
                  name="baseRate"
                  value={formData.baseRate}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <h2 className="font-bold text-slate-900">Réseaux Sociaux (Optionnel)</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourname"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  TikTok
                </label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  placeholder="@yourname"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Site Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardBody className="bg-red-50">
              <h3 className="font-bold text-red-900 mb-2">Zone Dangereuse</h3>
              <p className="text-sm text-red-800 mb-4">
                Les actions suivantes ne peuvent pas être annulées.
              </p>
              <Button type="button" variant="danger">
                Supprimer le profil
              </Button>
            </CardBody>
          </Card>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" type="button">
              Annuler
            </Button>
            <Button className="flex-1" type="submit" isLoading={isLoading}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
