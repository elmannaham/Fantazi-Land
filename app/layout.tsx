import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantazi-Land | Agence d'Hôtesses",
  description:
    "Découvrez et réservez les meilleures hôtesses pour vos événements et projets.",
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
