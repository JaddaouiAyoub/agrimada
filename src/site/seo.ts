import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/site/config";
import type { SiteImage } from "@/site/images";

/** Métadonnées d'une page publique : titre, description, langues alternatives, aperçu de partage. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  /** Chemin sans la langue, ex. "/produits". */
  path: string;
  title: string;
  description: string;
  image?: SiteImage;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
        "x-default": `/fr${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      ...(image
        ? { images: [{ url: image.src.src, width: image.src.width, height: image.src.height, alt: image.alt[locale] }] }
        : {}),
    },
  };
}
