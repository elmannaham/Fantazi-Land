import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/portfolio", label: "Galerie" },
  { href: "/about", label: "À propos" },
];

const HOSTESS_LINKS = [
  { href: "/profiles/create", label: "Créer un profil" },
  { href: "/dashboard", label: "Espace Hôtesse" },
];

const linkClass =
  "text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 rounded";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[#0b0a12] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-3 sm:px-8">
        <div>
          <Link href="/" className="font-display text-2xl font-bold text-white">
            Fantazi-Land
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Agence de booking d&apos;hôtesses et d&apos;égéries pour vos événements et projets.
          </p>
        </div>

        <nav aria-label="Navigation du site">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Découvrir</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Espace hôtesses">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Hôtesses</h2>
          <ul className="mt-4 space-y-2.5">
            {HOSTESS_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-slate-500 sm:px-8">
          © {year} Fantazi-Land. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
