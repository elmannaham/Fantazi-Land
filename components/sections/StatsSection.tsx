"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Award, ShieldCheck, Zap, Sparkles } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Collaborations Réussies",
      description: "Campagnes marques & shootings éditoriaux",
    },
    {
      icon: Award,
      value: "99.4%",
      label: "Satisfaction Clients",
      description: "Avis vérifiés et retours 5 étoiles",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Paiements Sécurisés",
      description: "Fonds bloqués jusqu'à validation des livrables",
    },
    {
      icon: Zap,
      value: "< 24h",
      label: "Délai Moyen de Réponse",
      description: "Prise de contact et devis instantanés",
    },
  ];

  return (
    <section className="bg-slate-900 py-16 px-4 text-white relative overflow-hidden my-16 rounded-3xl mx-4 sm:mx-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            L'Engagement Fantazi-Land
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            La Référence du Booking Haut de Gamme
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Une infrastructure pensée pour valoriser les hôtesses et garantir un résultat parfait aux annonceurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <h3 className="text-sm font-bold text-purple-200 mt-1">
                  {stat.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
