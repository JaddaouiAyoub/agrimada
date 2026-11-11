import type { MetadataRoute } from "next";
import { LOCALES, SITE_PAGES, siteUrl } from "@/site/config";

const PAGES: string[] = [...SITE_PAGES, "/credits"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${base}/${locale}${page}`,
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1 : page === "/credits" ? 0.2 : 0.8,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}/${l}${page}`])) },
    })),
  );
}
