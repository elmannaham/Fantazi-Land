"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 py-20 px-4 text-white shadow-md">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            À propos de Fantazi-Land
          </h1>
          <p className="mx-auto max-w-2xl text-lg opacity-90 sm:text-xl">
            Révolutionner la mise en relation entre créateurs et clients
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Notre Mission</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Fantazi-Land est une plateforme innovante dédiée à la mise en relation entre clients et créateurs de contenu. Nous croyons que chaque créateur mérite une plateforme sécurisée, transparente et facile à utiliser pour gérer ses collaborations.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Notre objectif est de simplifier le processus de réservation et de collaboration en offrant des outils puissants pour les créateurs et une expérience seamless pour les clients.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-purple-600 mb-6">Nos Valeurs</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold text-xl">✓</span>
                <span className="text-slate-700">
                  <strong>Transparence</strong> - Communication claire et honnête avec tous nos utilisateurs
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold text-xl">✓</span>
                <span className="text-slate-700">
                  <strong>Qualité</strong> - Standards élevés pour nos créateurs et services
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold text-xl">✓</span>
                <span className="text-slate-700">
                  <strong>Sécurité</strong> - Protection des données et transactions sécurisées
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-600 font-bold text-xl">✓</span>
                <span className="text-slate-700">
                  <strong>Innovation</strong> - Évolution constante pour mieux servir notre communauté
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Pourquoi choisir Fantazi-Land?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Plateforme Intuitive</h3>
              <p className="text-slate-600">
                Une interface utilisateur simple et élégante pour gérer vos profils et réservations en quelques clics.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sécurité Renforcée</h3>
              <p className="text-slate-600">
                Authentification sécurisée et protection des données pour tous les utilisateurs de la plateforme.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Système de Notation</h3>
              <p className="text-slate-600">
                Avis vérifiés et système de notation transparent pour gagner la confiance des clients.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Statistiques Détaillées</h3>
              <p className="text-slate-600">
                Suivi complet de vos réservations, revenus et performances pour optimiser vos stratégies.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Intégrations Multiples</h3>
              <p className="text-slate-600">
                Connectez vos réseaux sociaux et outils favoris pour une gestion centralisée.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Support Client</h3>
              <p className="text-slate-600">
                Équipe support réactive disponible pour répondre à vos questions et résoudre les problèmes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Nos Chiffres
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <p className="text-slate-600">Créateurs actifs</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">5K+</div>
            <p className="text-slate-600">Réservations complétées</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">4.8★</div>
            <p className="text-slate-600">Note moyenne</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">€2M+</div>
            <p className="text-slate-600">Revenus générés</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 py-16 px-4 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">Rejoignez Notre Communauté</h2>
          <p className="text-lg opacity-90 mb-8">
            Que vous soyez créateur ou client, Fantazi-Land est l'endroit idéal pour développer vos collaborations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profiles/create">
              <Button className="w-full sm:w-auto">
                Devenir Créateur
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full sm:w-auto">
                Découvrir nos Créateurs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Des Questions?</h3>
          <p className="text-slate-600 mb-8">
            Notre équipe est prête à vous aider. Contactez-nous pour plus d'informations sur Fantazi-Land.
          </p>
          <Button>
            Nous Contacter
          </Button>
        </div>
      </section>
    </main>
  );
}
