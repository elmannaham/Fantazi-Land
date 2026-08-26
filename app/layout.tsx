import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantazi-Land | Agence de Créatrices de Contenu",
  description:
    "Découvrez et réservez les meilleures créatrices de contenu pour vos projets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
