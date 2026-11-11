import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

// Document HTML de l'application de gestion (privée, non indexée).
// Utilisé par les gabarits (auth) et (dashboard) : le site vitrine a son propre document.

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const appMetadata: Metadata = {
  title: { default: "FarmShare", template: "%s · FarmShare" },
  description: "Gestion financière de la ferme partagée",
  robots: { index: false, follow: false },
};

export const appViewport: Viewport = {
  themeColor: "#1d3a2d",
};

export function AppDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
