import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope, Noto_Naskh_Arabic } from "next/font/google";
import { LOCALES, isLocale, localeDir, siteUrl, whatsappLink } from "@/site/config";
import { getDictionary } from "@/site/i18n";
import { SiteFooter } from "@/site/components/site-footer";
import { SiteHeader } from "@/site/components/site-header";
import { WhatsAppFloat } from "@/site/components/whatsapp-float";
import { getImage } from "@/site/images";
import "@/site/site.css";

// Polices : poids réduits au strict nécessaire.
// - Cormorant et Manrope servent dans les deux langues (le logo reste en français) : préchargées.
// - Noto Naskh (arabe) et l'italique ne sont pas préchargées : le navigateur ne les télécharge
//   que si la page les utilise réellement, la page française n'attend donc pas la police arabe.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-naskh",
  display: "swap",
  preload: false,
});

// Les deux langues sont pré-générées ; toute autre valeur renvoie une 404 (voir notFound ci-dessous).
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#263d2b" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const hero = getImage("roses-champ-kasbah");
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: dict.meta.title, template: "%s · Agrimada" },
    description: dict.meta.description,
    applicationName: "Agrimada",
    icons: { icon: "/agrimada-icon.svg" },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", ar: "/ar", "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      siteName: "Agrimada",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: hero.src.src, width: hero.src.width, height: hero.src.height, alt: hero.alt[locale] }],
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  const nav = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/ferme`, label: dict.nav.farm },
    { href: `/${locale}/produits`, label: dict.nav.products },
    { href: `/${locale}/activites`, label: dict.nav.activities },
    { href: `/${locale}/galerie`, label: dict.nav.gallery },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];
  const whatsapp = whatsappLink(dict.common.whatsappMessage);

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${cormorantItalic.variable} ${manrope.variable} ${naskh.variable}`}
    >
      <body className="min-h-dvh overflow-x-clip">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-5 focus:py-2.5 focus:text-ivory"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader
          locale={locale}
          nav={nav}
          whatsappHref={whatsapp}
          labels={{
            menu: dict.nav.menu,
            close: dict.nav.close,
            switchLanguage: dict.nav.switchLanguage,
            switchLanguageLabel: dict.nav.switchLanguageLabel,
            writeUs: dict.common.writeUs,
          }}
        />
        <main id="contenu">{children}</main>
        <SiteFooter locale={locale} dict={dict} nav={nav} />
        <WhatsAppFloat href={whatsapp} label={`${dict.common.writeUs} — WhatsApp`} />
      </body>
    </html>
  );
}
