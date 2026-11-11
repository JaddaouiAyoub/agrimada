import type { MetadataRoute } from "next";
import { siteUrl } from "@/site/config";

// Le site vitrine est indexable ; l'application de gestion ne l'est pas.
const PRIVATE_PATHS = [
  "/api/",
  "/login",
  "/activate",
  "/forgot-password",
  "/dashboard",
  "/expenses",
  "/revenues",
  "/contributions",
  "/transactions",
  "/reports",
  "/members",
  "/categories",
  "/settings",
  "/audit",
  "/profile",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/fr", "/ar"], disallow: PRIVATE_PATHS }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
