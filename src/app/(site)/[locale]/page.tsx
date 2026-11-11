import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, CONTACT, isLocale, siteUrl, whatsappLink, type Locale } from "@/site/config";
import { PRODUCTS } from "@/site/content/products";
import { StarMark, WhatsAppIcon } from "@/site/components/icons";
import { KasbahDivider } from "@/site/components/kasbah-divider";
import { ProductCard } from "@/site/components/product-card";
import { SeasonCalendar, SeasonLegend } from "@/site/components/season-calendar";
import { Reveal } from "@/site/components/reveal";
import { SectionHeading } from "@/site/components/section-heading";
import { getDictionary, type Dictionary } from "@/site/i18n";
import { getImage, type ImageKey } from "@/site/images";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <OrganizationJsonLd locale={locale} dict={dict} />
      <Hero locale={locale} dict={dict} />
      <Facts dict={dict} />
      <Story locale={locale} dict={dict} />
      <Values dict={dict} />
      <Products locale={locale} dict={dict} />
      <Seasons locale={locale} dict={dict} />
      <GalleryTeaser locale={locale} dict={dict} />
      <ContactBand locale={locale} dict={dict} />
    </>
  );
}

type SectionProps = { locale: Locale; dict: Dictionary };

const arrow = "size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1";

// ---------------------------------------------------------------------------
// 1. Photo d'accueil
// ---------------------------------------------------------------------------

function Hero({ locale, dict }: SectionProps) {
  const image = getImage("roses-champ-kasbah");
  const t = dict.home.hero;
  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden bg-forest-deep pt-32 text-ivory">
      <Image
        src={image.src}
        alt={image.alt[locale]}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="hero-zoom -z-20 object-cover object-[50%_60%]"
      />
      {/* Voile : lisibilité du texte sans éteindre la photo. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(27,44,31,0.55)_0%,rgba(27,44,31,0.05)_35%,rgba(27,44,31,0.25)_60%,rgba(27,44,31,0.88)_100%)]"
        aria-hidden
      />

      <div className="container-site pb-16 sm:pb-20 lg:pb-24">
        <p className="eyebrow inline-flex items-center gap-2.5 text-ivory/85">
          <StarMark className="size-3 text-saffron" />
          {t.eyebrow}
        </p>
        <h1 className="display mt-5 max-w-4xl text-[2.7rem] text-ivory sm:text-6xl lg:text-[5.4rem]">{t.title}</h1>
        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ivory/80 sm:text-lg">{t.subtitle}</p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/${locale}/ferme`}
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-saffron px-7 py-4 text-[0.95rem] font-semibold text-forest-deep transition-colors hover:bg-[#d8ab49]"
          >
            {t.primary}
            <ArrowRight className={arrow} aria-hidden />
          </Link>
          <Link
            href={`/${locale}/produits`}
            className="inline-flex items-center justify-center rounded-full border border-ivory/45 px-7 py-4 text-[0.95rem] font-semibold text-ivory backdrop-blur-sm transition-colors hover:bg-ivory/10"
          >
            {t.secondary}
          </Link>
        </div>
      </div>

      <a
        href="#reperes"
        className="absolute end-6 bottom-8 hidden flex-col items-center gap-3 text-xs text-ivory/70 lg:flex"
      >
        <span className="[writing-mode:vertical-rl]">{t.scroll}</span>
        <ArrowDown className="scroll-cue size-4" aria-hidden />
      </a>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Repères chiffrés
// ---------------------------------------------------------------------------

function Facts({ dict }: { dict: Dictionary }) {
  return (
    <section id="reperes" aria-label={dict.home.story.eyebrow} className="border-b border-forest/10 bg-ivory">
      <dl className="container-site grid grid-cols-2 lg:grid-cols-4">
        {dict.home.facts.map((fact, i) => (
          <Reveal
            key={fact.label}
            delay={i * 90}
            className={cn(
              "flex flex-col border-forest/10 py-9 sm:py-11",
              i % 2 === 1 && "border-s ps-5 sm:ps-8",
              i >= 2 && "border-t lg:border-t-0",
              i >= 1 && "lg:border-s lg:ps-8",
            )}
          >
            <dt className="order-2 mt-2 text-[0.85rem] text-stone">{fact.label}</dt>
            <dd className="display order-1 text-[2.6rem] text-forest sm:text-5xl">{fact.value}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Présentation de la ferme
// ---------------------------------------------------------------------------

function Story({ locale, dict }: SectionProps) {
  const t = dict.home.story;
  const main = getImage("paysage-vallee-oasis-atlas");
  const detail = getImage("roses-panier-kasbah");
  return (
    <section className="bg-ivory py-24 sm:py-32">
      <div className="container-site grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <Reveal className="relative lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
            <Image src={main.src} alt={main.alt[locale]} fill placeholder="blur" sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-10 end-4 w-[42%] overflow-hidden rounded-t-[999px] border-[6px] border-ivory shadow-[0_24px_50px_-20px_rgba(27,44,31,0.45)] sm:end-8">
            <div className="relative aspect-[3/4]">
              <Image src={detail.src} alt={detail.alt[locale]} fill placeholder="blur" sizes="(min-width: 1024px) 22vw, 40vw" className="object-cover" />
            </div>
          </div>
          <span className="absolute start-4 -top-5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-ivory sm:start-8">
            <StarMark className="size-3 text-saffron" />
            {t.badge}
          </span>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5 lg:ps-6">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <div className="mt-7 space-y-5 text-[1.05rem] leading-[1.8] text-ink/75">
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link
            href={`/${locale}/ferme`}
            className="group mt-9 inline-flex items-center gap-2.5 border-b border-saffron pb-1 font-semibold text-forest"
          >
            {t.cta}
            <ArrowRight className={arrow} aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. Valeurs
// ---------------------------------------------------------------------------

function Values({ dict }: { dict: Dictionary }) {
  const t = dict.home.values;
  return (
    <section className="relative bg-forest py-24 text-ivory sm:py-32">
      <KasbahDivider id="values" className="absolute inset-x-0 -top-3.5 text-forest" />
      <div className="container-site">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} tone="light" />
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[2px] bg-ivory/10 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 100} className="bg-forest p-8 lg:p-9">
              <span className="display block text-5xl text-saffron/90 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display mt-8 text-[1.75rem] text-ivory">{item.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/65">{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. Produits
// ---------------------------------------------------------------------------

function Products({ locale, dict }: SectionProps) {
  const t = dict.home.products;
  return (
    <section className="bg-sand py-24 sm:py-32">
      <div className="container-site">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
          <Link href={`/${locale}/produits`} className="group inline-flex shrink-0 items-center gap-2.5 border-b border-saffron pb-1 font-semibold text-forest">
            {t.all}
            <ArrowRight className={arrow} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Mobile : défilement horizontal ; tablette : 2 colonnes ; ordinateur : 4. */}
      <div className="container-site mt-14">
        <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.slug} delay={i * 90} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={product} locale={locale} dict={dict} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. Calendrier des activités
// ---------------------------------------------------------------------------

function Seasons({ locale, dict }: SectionProps) {
  const t = dict.home.seasons;
  return (
    <section className="bg-ivory py-24 sm:py-32">
      <div className="container-site grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
          <div className="mt-8">
            <SeasonLegend dict={dict} />
          </div>
          <Link
            href={`/${locale}/activites`}
            className="group mt-10 inline-flex items-center gap-2.5 border-b border-saffron pb-1 font-semibold text-forest"
          >
            {t.cta}
            <ArrowRight className={arrow} aria-hidden />
          </Link>
        </div>

        <Reveal className="lg:col-span-8">
          <SeasonCalendar dict={dict} />
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 7. Aperçu de la galerie
// ---------------------------------------------------------------------------

const GALLERY_PREVIEW: { key: ImageKey; className: string }[] = [
  { key: "roses-petales-tapis", className: "col-span-2 row-span-2" },
  { key: "safran-emondage-table", className: "" },
  { key: "amandiers-fleuris-kasbah", className: "" },
  { key: "olives-cueillette", className: "" },
  { key: "safran-cueillette-paniers", className: "" },
];

function GalleryTeaser({ locale, dict }: SectionProps) {
  const t = dict.home.gallery;
  return (
    <section className="bg-sand py-24 sm:py-32">
      <div className="container-site">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
          <Link href={`/${locale}/galerie`} className="group inline-flex shrink-0 items-center gap-2.5 border-b border-saffron pb-1 font-semibold text-forest">
            {t.cta}
            <ArrowRight className={arrow} aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-4">
          {GALLERY_PREVIEW.map(({ key, className }, i) => {
            const image = getImage(key);
            return (
              <Reveal as="figure" key={key} delay={i * 80} className={cn("group relative overflow-hidden rounded-[2px]", className)}>
                <Image
                  src={image.src}
                  alt={image.alt[locale]}
                  fill
                  placeholder="blur"
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105"
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. Contact
// ---------------------------------------------------------------------------

function ContactBand({ locale, dict }: SectionProps) {
  const t = dict.home.contact;
  const image = getImage("paysage-vallee-oasis-atlas");
  return (
    <section className="relative isolate overflow-hidden bg-forest-deep py-28 text-ivory sm:py-36">
      <Image src={image.src} alt="" fill placeholder="blur" sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-forest-deep/80" aria-hidden />
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.text} tone="light" align="center" />
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={whatsappLink(dict.common.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-whatsapp px-7 py-4 font-semibold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <WhatsAppIcon className="size-5" />
              {t.whatsapp}
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-ivory/40 px-7 py-4 font-semibold transition-colors hover:bg-ivory/10 sm:w-auto"
            >
              <Phone className="size-4.5" aria-hidden />
              <span className="sr-only">{t.callLabel} : </span>
              <span dir="ltr">{CONTACT.phoneDisplay}</span>
            </a>
          </div>
          <p className="mt-8 text-sm text-ivory/60">{CONTACT.address[locale]}</p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Données structurées (référencement local)
// ---------------------------------------------------------------------------

function OrganizationJsonLd({ locale, dict }: SectionProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND.name,
    alternateName: BRAND.nameAr,
    description: dict.meta.description,
    url: `${siteUrl()}/${locale}`,
    telephone: `+${CONTACT.whatsappNumber}`,
    foundingDate: String(BRAND.foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kalaat M'Gouna",
      addressRegion: "Drâa-Tafilalet",
      addressCountry: "MA",
    },
    geo: { "@type": "GeoCoordinates", latitude: CONTACT.geo.lat, longitude: CONTACT.geo.lng },
  };
  return (
    <script
      type="application/ld+json"
      // Données statiques internes ; « < » échappé par précaution.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
