import { notFound } from "next/navigation";

// Toute adresse inconnue sous /fr ou /ar affiche la page introuvable du site
// ([locale]/not-found.tsx), avec son en-tête et son pied de page.
export default function UnknownSitePage() {
  notFound();
}
