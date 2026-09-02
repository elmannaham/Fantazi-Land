import type { Metadata } from "next";
import { Navbar } from "./_components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantazi-Land | Book Professional Creators",
  description: "Browse and book professional creators for your next project",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
