"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-purple-600">
            Fantazi-Land
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-purple-600">
              Tableau de bord
            </Link>
            <Link href="/dashboard/profile/1/edit" className="text-sm font-medium text-slate-700 hover:text-purple-600">
              Mon profil
            </Link>
            <Link href="/dashboard/bookings" className="text-sm font-medium text-slate-700 hover:text-purple-600">
              Réservations
            </Link>
            <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
