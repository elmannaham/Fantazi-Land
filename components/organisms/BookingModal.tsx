"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, CreditCard, Sparkles, CheckCircle2, User, Mail, FileText } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    baseRate?: number | null;
    currency?: string;
    category: string;
    avatarUrl?: string | null;
  };
}

export function BookingModal({ isOpen, onClose, creator }: BookingModalProps) {
  const [hours, setHours] = useState(2);
  const [date, setDate] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rate = creator.baseRate || 150;
  const currency = creator.currency || "EUR";
  const estimatedTotal = rate * hours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: creator.id,
          projectTitle: projectTitle.trim() || `Collaboration avec ${creator.name}`,
          projectDescription: `Réservation pour ${hours}h le ${date}. Notes: ${notes}`,
          startDate: date ? new Date(date).toISOString() : new Date().toISOString(),
          budget: estimatedTotal,
          currency: currency,
          clientName: clientName.trim() || "Client Fantazi-Land",
          clientEmail: clientEmail.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Une erreur est survenue lors de la réservation.");
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur de réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop avec blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 border border-slate-100 my-8"
          >
            {/* Close Button */}
            <button
              onClick={handleResetAndClose}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Demande confirmée !</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Votre demande de réservation pour <strong className="text-purple-700">{creator.name}</strong> a été enregistrée avec succès. Notre équipe et l'hôtesse vous répondront rapidement.
                </p>
                <div className="pt-4">
                  <Button variant="primary" onClick={handleResetAndClose} className="w-full">
                    Fermer la fenêtre
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold">
                      {creator.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                      <Sparkles className="h-3 w-3" /> Réservation Prioritaire
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Réserver {creator.name}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">{creator.category}</p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    {errorMessage}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Titre du projet / Événement *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Shooting Lookbook Été / Campagne TikTok"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Votre Nom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Votre nom ou marque"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email de contact *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="contact@agence.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date souhaitée
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Durée estimée</span>
                        <span className="text-purple-600 font-extrabold">{hours}h</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full accent-purple-600 mt-2 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Détails ou instructions spécifiques (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Précisez le lieu, le style attendu ou les livrables..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition resize-none"
                    />
                  </div>

                  {/* Estimation Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-4 border border-purple-100 flex items-center justify-between shadow-inner">
                    <div>
                      <p className="text-[11px] text-purple-700 font-medium">
                        Tarif de base : {rate} {currency}/h × {hours}h
                      </p>
                      <p className="text-xl font-extrabold text-purple-950">
                        {estimatedTotal} {currency}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-700 shadow-sm border border-purple-100">
                      Garantie Booking
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetAndClose}
                      className="w-1/3 text-xs sm:text-sm py-2.5"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="w-2/3 text-xs sm:text-sm py-2.5"
                    >
                      Envoyer la demande
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
