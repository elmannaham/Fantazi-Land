"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Photographie",
  "Vidéographie",
  "Contenu Mode",
  "Beauté",
  "Lifestyle",
  "Gaming",
  "intime rencontre",
  "Dinner & Show",
  "Homme",
];

const CURRENCIES = ["EUR", "USD", "GBP", "CAD"];

const RESEND_COOLDOWN_SECONDS = 30;

export default function CreateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Auth form states
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Photographie",
    bio: "",
    avatarUrl: "",
    baseRate: "",
    currency: "EUR",
    instagram: "",
    tiktok: "",
    twitter: "",
    website: "",
    isPublic: true,
    isAvailable: true,
  });

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setPendingConfirmationEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (signInError) throw signInError;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (signUpError) throw signUpError;

        // Supabase only returns a session when email confirmation is disabled
        // (or the address auto-confirms). Otherwise a confirmation email was
        // just sent and the user isn't authenticated yet.
        if (!signUpData.session) {
          setPendingConfirmationEmail(authEmail);
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail || resendCooldown > 0) return;
    setResendLoading(true);
    setResendMessage(null);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: pendingConfirmationEmail,
      });
      if (resendError) throw resendError;
      setResendMessage("Email de confirmation renvoyé.");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || "Impossible de renvoyer l'email pour le moment.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Vous devez être connecté pour créer un profil.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        bio: formData.bio.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        baseRate: formData.baseRate ? parseFloat(formData.baseRate) : undefined,
        currency: formData.currency,
        instagram: formData.instagram.trim() || undefined,
        tiktok: formData.tiktok.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        website: formData.website.trim() || undefined,
        isPublic: formData.isPublic,
        isAvailable: formData.isAvailable,
      };

      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la création du profil");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour à l'accueil
          </Link>
          {user && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Déconnexion ({user.email})
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          {!user && pendingConfirmationEmail ? (
            /* Email Confirmation Pending */
            <div className="text-center">
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Vérifiez votre boîte mail
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Un email de confirmation a été envoyé à{" "}
                <span className="font-semibold text-gray-900">{pendingConfirmationEmail}</span>.
                Cliquez sur le lien qu'il contient pour activer votre compte.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {resendMessage && !error && (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-green-700"
                >
                  {resendMessage}
                </div>
              )}

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full rounded-xl bg-purple-600 py-3 text-white font-semibold shadow-lg hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendLoading
                    ? "Envoi..."
                    : resendCooldown > 0
                      ? `Renvoyer l'email (${resendCooldown}s)`
                      : "Renvoyer l'email de confirmation"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingConfirmationEmail(null);
                    setIsLogin(true);
                    setError(null);
                    setResendMessage(null);
                  }}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Login / Signup Section */
            <div>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {isLogin ? "Connexion" : "Inscription"}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {isLogin
                    ? "Connectez-vous pour créer et gérer votre profil."
                    : "Créez votre compte pour rejoindre l'agence Fantazi-Land."}
                </p>
              </div>

              {error && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-purple-600 py-3 text-white font-semibold shadow-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Profile Creation Form */
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Créer un profil hôtesse
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Rejoignez le catalogue Fantazi-Land et collaborez avec des marques et agences.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">Erreur :</p>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <p className="font-semibold">🎉 Profil créé avec succès !</p>
                  <p>Redirection vers votre tableau de bord...</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom & Catégorie */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom complet / Nom d'artiste *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Marina Dupont"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Catégorie principale *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Biographie / Présentation
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Décrivez votre style, votre expérience et votre univers artistique..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label
                    htmlFor="avatarUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    URL de la photo de profil (Avatar)
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Tarifs & Devise */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="baseRate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tarif de base indicatif
                    </label>
                    <input
                      type="number"
                      id="baseRate"
                      name="baseRate"
                      min="0"
                      step="50"
                      value={formData.baseRate}
                      onChange={handleChange}
                      placeholder="Ex: 1500"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Devise
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {CURRENCIES.map((cur) => (
                        <option key={cur} value={cur}>
                          {cur}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Réseaux & Liens
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="instagram"
                        className="block text-xs font-medium text-gray-600"
                      >
                        Instagram
                      </label>
                      <input
                        type="url"
                        id="instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="https://instagram.com/..."
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="tiktok"
                        className="block text-xs font-medium text-gray-600"
                      >
                        TikTok
                      </label>
                      <input
                        type="url"
                        id="tiktok"
                        name="tiktok"
                        value={formData.tiktok}
                        onChange={handleChange}
                        placeholder="https://tiktok.com/@..."
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="twitter"
                        className="block text-xs font-medium text-gray-600"
                      >
                        Twitter / X
                      </label>
                      <input
                        type="url"
                        id="twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder="https://x.com/..."
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="website"
                        className="block text-xs font-medium text-gray-600"
                      >
                        Site Web / Portfolio
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://monsite.com"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Options de visibilité */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Profil public dans le catalogue
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Disponible pour des projets
                  </label>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 px-4 text-base font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon profil"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

