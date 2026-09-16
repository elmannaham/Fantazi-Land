"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/Button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 py-24 px-4 text-center sm:py-28">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[420px] w-[90vw] max-w-[640px] -translate-x-1/2 rounded-full blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-purple-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Depuis 2024 · L'agence de référence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            À propos de{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Fantazi-Land
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl"
          >
            Révolutionner la mise en relation entre hôtesses et clients
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/profiles/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Devenir Hôtesse</Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Découvrir nos Hôtesses
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Notre Mission</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Fantazi-Land est une plateforme innovante dédiée à la mise en relation entre clients et hôtesses professionnelles. Nous croyons que chaque hôtesse mérite une plateforme sécurisée, transparente et facile à utiliser pour gérer ses collaborations.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Notre objectif est de simplifier le processus de réservation et de collaboration en offrant des outils puissants pour les hôtesses et une expérience seamless pour les clients.
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
                  <strong>Qualité</strong> - Standards élevés pour nos hôtesses et services
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
            <p className="text-slate-600">Hôtesses actives</p>
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
            Que vous soyez hôtesse ou client, Fantazi-Land est l'endroit idéal pour développer vos collaborations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profiles/create">
              <Button className="w-full sm:w-auto">
                Devenir Hôtesse
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full sm:w-auto">
                Découvrir nos Hôtesses
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
