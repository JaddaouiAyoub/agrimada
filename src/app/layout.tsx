// Gabarit racine minimal : chaque partie définit son propre <html> (langue, sens de lecture, polices).
//  - site vitrine : (site)/[locale]/layout.tsx
//  - application  : (auth)/layout.tsx et (dashboard)/layout.tsx, via <AppDocument>
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
