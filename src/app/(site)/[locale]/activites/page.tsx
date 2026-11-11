import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { isLocale } from "@/site/config";
import { KasbahDivider } from "@/site/components/kasbah-divider";
import { PageHero } from "@/site/components/page-hero";
import { Reveal } from "@/site/components/reveal";
import { SeasonCalendar, SeasonLegend } from "@/site/components/season-calendar";
import { SectionHeading } from "@/site/components/section-heading";
import { getDictionary } from "@/site/i18n";
import { getImage, type ImageKey } from "@/site/images";
import { pageMetadata } from "@/site/seo";
import { arrowClass, btnPrimary } from "@/site/styles";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.activities;
  return pageMetadata({
    locale,
    path: "/activites",
    title: t.metaTitle,
    description: t.metaDescription,
    image: getImage("safran-cueillette-paniers"),
  });
}

// Deux photos par activité : une principale, une de détail.
const ACTIVITY_IMAGES: Record<string, [ImageKey, ImageKey]> = {
  roses: ["roses-panier-kasbah", "rose-damascena-kelaa"],
  saffron: ["safran-cueillette-paniers", "safran-emondage-mains"],
  olives: ["oliviers-menara", "olives-branche"],
  almonds: ["amandiers-fleuris-kasbah", "amandier-azilal"],
  harvest: ["safran-emondage-table", "roses-sechees"],
  sales: ["safran-bocal", "huile-olive-bouteille"],
};

export default async function ActivitiesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.activities;

  return (
    <>
      <PageHero
        locale={locale}
        image={getImage("safran-cueillette-paniers")}
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        position="50% 60%"
      />

      {/* Sommaire numéroté */}
      <section className="border-b border-forest/10 bg-ivory">
        <ol className="container-site grid grid-cols-2 gap-px py-0 sm:grid-cols-3 lg:grid-cols-6">
          {t.items.map((item, i) => (
            <li key={item.key}>
              <a href={`#${item.key}`} className="group flex h-full flex-col gap-2 py-6 pe-4 transition-colors hover:text-olive">
                <span className="display text-2xl text-saffron tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-semibold leading-snug text-forest group-hover:text-olive">{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* Activités, en alternance */}
      <div className="bg-ivory">
        {t.items.map((item, i) => {
          const [mainKey, detailKey] = ACTIVITY_IMAGES[item.key] ?? ["roses-champ-kasbah", "rose-damascena-gros-plan"];
          const main = getImage(mainKey);
          const detail = getImage(detailKey);
          const reversed = i % 2 === 1;
          return (
            <section
              key={item.key}
              id={item.key}
              aria-labelledby={`${item.key}-title`}
              className={cn("scroll-mt-24 py-20 sm:py-28", i % 2 === 1 && "bg-sand")}
            >
              <div className="container-site grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                <Reveal className={cn("relative pb-12 lg:col-span-7", reversed && "lg:order-2 lg:col-start-6")}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
                    <Image src={main.src} alt={main.alt[locale]} fill placeholder="blur" sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                  </div>
                  <div
                    className={cn(
                      "absolute bottom-0 w-[38%] overflow-hidden rounded-t-[999px] border-[6px] shadow-[0_24px_50px_-20px_rgba(27,44,31,0.45)]",
                      reversed ? "start-6 border-sand" : "end-6 border-ivory",
                    )}
                  >
                    <div className="relative aspect-[3/4]">
                      <Image src={detail.src} alt={detail.alt[locale]} fill placeholder="blur" sizes="(min-width: 1024px) 20vw, 38vw" className="object-cover" />
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={120} className={cn("lg:col-span-5", reversed ? "lg:order-1 lg:pe-6" : "lg:ps-6")}>
                  <span className="display text-6xl text-saffron/80 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h2 id={`${item.key}-title`} className="display mt-3 text-[2.4rem] text-forest sm:text-5xl">
                    {item.title}
                  </h2>
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-forest/5 px-3.5 py-1.5 text-sm font-medium text-forest">
                    <CalendarDays className="size-4 text-saffron" aria-hidden />
                    {item.season}
                  </p>
                  <p className="mt-6 text-[1.05rem] leading-[1.8] text-ink/75">{item.text}</p>
                  <h3 className="eyebrow mt-9 text-olive">{t.stepsLabel}</h3>
                  <ol className="mt-4 space-y-3">
                    {item.steps.map((step, s) => (
                      <li key={step} className="flex items-center gap-4">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-saffron text-sm font-semibold text-saffron-deep">
                          {s + 1}
                        </span>
                        <span className="text-[0.98rem] text-ink/80">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      {/* Calendrier */}
      <section className="relative bg-forest-deep py-24 text-ivory sm:py-32">
        <KasbahDivider id="activities-calendar" className="absolute inset-x-0 -top-3.5 text-forest-deep" />
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow={t.eyebrow} title={t.calendarTitle} subtitle={t.calendarSubtitle} tone="light" />
            <div className="[&_*]:text-ivory/75">
              <SeasonLegend dict={dict} />
            </div>
          </div>
          <Reveal className="mt-14 rounded-[2px] bg-ivory p-5 sm:p-8">
            <SeasonCalendar dict={dict} />
          </Reveal>
          <div className="mt-12">
            <Link href={`/${locale}/produits`} className={btnPrimary}>
              {dict.nav.products}
              <ArrowRight className={arrowClass} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
