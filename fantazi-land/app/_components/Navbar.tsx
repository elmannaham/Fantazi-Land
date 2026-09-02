'use client';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold text-purple-600">
            Fantazi-Land
          </div>

          {/* Navigation Links */}
          <div className="flex gap-6">
            <a
              href="/"
              className="text-slate-700 hover:text-purple-600 transition-colors"
            >
              Browse
            </a>
            <a
              href="/help"
              className="text-slate-700 hover:text-purple-600 transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
