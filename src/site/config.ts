// Configuration du site vitrine Agrimada (partie publique).
// Les valeurs marquées PROVISOIRE sont à remplacer par les informations réelles.

export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const BRAND = {
  name: "Agrimada",
  nameAr: "أكريمادا",
  foundedYear: 2020,
  areaHectares: 7,
};

/** Numéro unique : téléphone et WhatsApp (format international sans « + » pour wa.me). */
const PHONE_INTERNATIONAL = "212700547163";

export const CONTACT = {
  phoneDisplay: "07 00 54 71 63",
  phoneHref: `tel:+${PHONE_INTERNATIONAL}`,
  whatsappNumber: PHONE_INTERNATIONAL,
  // PROVISOIRE : adresse précise de l'exploitation.
  address: {
    fr: "Kalaat M'Gouna, province de Tinghir, Drâa-Tafilalet, Maroc",
    ar: "قلعة مكونة، إقليم تنغير، جهة درعة تافيلالت، المغرب",
  },
  // PROVISOIRE : coordonnées du centre de Kalaat M'Gouna, à remplacer par celles de la ferme.
  geo: { lat: 31.2427, lng: -6.1291 },
  // PROVISOIRE : réseaux sociaux (null = non affiché).
  socials: {
    instagram: null as string | null,
    facebook: null as string | null,
  },
};

/** Lien WhatsApp avec message pré-rempli. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** URL publique (liens absolus, SEO). */
export function siteUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Pages publiques existantes (navigation, plan du site). */
export const SITE_PAGES = ["", "/ferme", "/produits", "/activites", "/galerie", "/contact"] as const;
export type SitePage = (typeof SITE_PAGES)[number];

export function localePath(locale: Locale, page: string = ""): string {
  return `/${locale}${page}`;
}
