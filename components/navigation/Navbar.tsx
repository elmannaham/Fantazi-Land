import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Fantazi-Land
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-gray-600 transition-colors hover:text-purple-600"
          >
            À propos
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            Espace Créatrice
          </Link>
        </div>
      </div>
    </nav>
  );
}
