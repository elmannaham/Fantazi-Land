export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 px-4 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-4 text-5xl font-bold">Fantazi-Land</h1>
          <p className="text-xl opacity-90">
            Découvrez les meilleures créatrices de contenu
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-gray-600">
          Chargement des profils...
        </p>
      </section>
    </main>
  );
}
