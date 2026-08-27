import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Fantazi-Land
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/portfolio"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-purple-600 sm:inline-block"
          >
            Portfolio 3D
          </Link>
          <Link
            href="/about"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-purple-600 sm:inline-block"
          >
            À propos
          </Link>
          <Link
            href="/profiles/create"
            className="flex items-center gap-1.5 rounded-lg border border-purple-600 bg-white px-3.5 py-2 text-sm font-medium text-purple-600 shadow-sm transition-all hover:bg-purple-50"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Créer un profil
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-purple-700"
          >
            Espace Hôtesse
          </Link>
        </div>
      </div>
    </nav>
  );
}
