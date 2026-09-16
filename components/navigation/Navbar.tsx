"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="whitespace-nowrap text-xl font-bold text-purple-600 sm:text-2xl"
          onClick={() => setIsMenuOpen(false)}
        >
          Fantazi-Land
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/portfolio"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-purple-600"
          >
            Galerie
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-purple-600"
          >
            À propos
          </Link>
          <Link
            href="/profiles/create"
            className="flex items-center gap-1.5 rounded-lg border border-purple-600 bg-white px-3.5 py-2 text-sm font-medium text-purple-600 shadow-sm transition-colors hover:bg-purple-50"
          >
            <Plus className="h-4 w-4" />
            Créer un profil
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
          >
            Espace Hôtesse
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-purple-600 sm:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-t border-gray-200 bg-white px-4 py-3 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            <Link
              href="/portfolio"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
            >
              Galerie
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
            >
              À propos
            </Link>
            <Link
              href="/profiles/create"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-purple-600 bg-white px-3.5 py-2.5 text-sm font-medium text-purple-600 shadow-sm transition-colors hover:bg-purple-50"
            >
              <Plus className="h-4 w-4" />
              Créer un profil
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              Espace Hôtesse
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
