import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, CONTACT, isLocale, type Locale } from "@/site/config";
import { StarMark } from "@/site/components/icons";
import { KasbahDivider } from "@/site/components/kasbah-divider";
import { MapEmbed, googleMapsUrl } from "@/site/components/map-embed";
import { PageHero } from "@/site/components/page-hero";
import { Reveal } from "@/site/components/reveal";
import { SectionHeading } from "@/site/components/section-heading";
import { getDictionary } from "@/site/i18n";
import { getImage, type ImageKey } from "@/site/images";
import { pageMetadata } from "@/site/seo";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.farm;
  return pageMetadata({
    locale,
    path: "/ferme",
    title: t.metaTitle,
    description: t.metaDescription,
    image: getImage("amandiers-fleuris-kasbah"),
  });
}

// Grand écran : 2 rangées de 4 colonnes (2 + 1 + 1, puis 1 + 3).
const PHOTOS: { key: ImageKey; className: string }[] = [
  { key: "roses-champs-kelaa", className: "aspect-[16/10] sm:col-span-2 lg:aspect-auto" },
  { key: "safran-cueillette-paniers", className: "aspect-[4/5] lg:aspect-auto" },
  { key: "olives-cueillette", className: "aspect-[4/5] lg:aspect-auto" },
  { key: "amandier-azilal", className: "aspect-[4/5] sm:col-span-2 sm:aspect-[16/10] lg:col-span-1 lg:aspect-auto" },
  { key: "roses-petales-recolte-sac", className: "aspect-[16/10] sm:col-span-2 lg:col-span-3 lg:aspect-auto" },
];

export default async function FarmPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.farm;

  return (
    <>
      <PageHero
        locale={locale}
        image={getImage("amandiers-fleuris-kasbah")}
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        position="50% 45%"
      />

      {/* Histoire */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow={t.story.eyebrow} title={t.story.title} />
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-forest/10">
              <div className="bg-sand p-6">
                <dt className="text-sm text-stone">{dict.home.facts[0]?.label}</dt>
                <dd className="display mt-1 text-4xl text-forest">{BRAND.foundedYear}</dd>
              </div>
              <div className="bg-sand p-6">
                <dt className="text-sm text-stone">{dict.home.facts[1]?.label}</dt>
                <dd className="display mt-1 text-4xl text-forest">{dict.home.facts[1]?.value}</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={120} className="space-y-6 text-[1.08rem] leading-[1.85] text-ink/75 lg:col-span-6 lg:col-start-7">
            {t.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <blockquote className="border-s-2 border-saffron ps-6 pt-2">
              <p className="display text-[1.9rem] text-forest">« {t.story.quote} »</p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Localisation */}
      <section className="bg-sand py-24 sm:py-32">
        <div className="container-site grid items-start gap-14 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow={t.location.eyebrow} title={t.location.title} subtitle={t.location.text} />
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6">
              {t.location.facts.map((fact) => (
                <div key={fact.label} className="border-t border-forest/15 pt-4">
                  <dt className="text-sm text-stone">{fact.label}</dt>
                  <dd className="display mt-1 text-2xl text-forest">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-stone">{CONTACT.address[locale]}</p>
            <a
              href={googleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-olive"
            >
              {t.location.openMap}
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[2px]">
              <div className="relative aspect-[4/3]">
                <Image
                  src={getImage("vallee-dades-riviere").src}
                  alt={getImage("vallee-dades-riviere").alt[locale]}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <MapEmbed title={t.location.mapTitle} className="mt-4 aspect-[16/9]" />
          </Reveal>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="relative bg-forest py-24 text-ivory sm:py-32">
        <KasbahDivider id="farm-vision" className="absolute inset-x-0 -top-3.5 text-forest" />
        <div className="container-site">
          <SectionHeading eyebrow={t.vision.eyebrow} title={t.vision.title} tone="light" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {t.vision.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 120} className="rounded-[2px] border border-ivory/15 p-8 sm:p-10">
                <StarMark className="size-5 text-saffron" />
                <h3 className="display mt-6 text-3xl text-ivory">{item.title}</h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-ivory/70">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs + engagements */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-site grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow={dict.home.values.eyebrow} title={dict.home.values.title} />
            <ul className="mt-10 divide-y divide-forest/10 border-y border-forest/10">
              {dict.home.values.items.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 80} className="flex gap-5 py-6">
                  <span className="display w-8 shrink-0 text-2xl text-saffron tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="display text-2xl text-forest">{item.title}</h3>
                    <p className="mt-1.5 text-[0.97rem] leading-relaxed text-stone">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow={t.commitments.eyebrow} title={t.commitments.title} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {t.commitments.items.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 80} className="rounded-[2px] bg-sand p-6">
                  <span className="block h-px w-10 bg-saffron" aria-hidden />
                  <h3 className="display mt-5 text-[1.45rem] text-forest">{item.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-stone">{item.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Photos */}
      <FarmPhotos locale={locale} title={t.photosTitle} eyebrow={dict.home.gallery.eyebrow} />
    </>
  );
}

function FarmPhotos({ locale, title, eyebrow }: { locale: Locale; title: string; eyebrow: string }) {
  return (
    <section className="bg-sand pb-28 pt-24 sm:pt-32">
      <div className="container-site">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:auto-rows-[17rem] lg:grid-cols-4">
          {PHOTOS.map(({ key, className }, i) => {
            const image = getImage(key);
            return (
              <Reveal as="figure" key={key} delay={i * 70} className={cn("relative overflow-hidden rounded-[2px]", className)}>
                <Image
                  src={image.src}
                  alt={image.alt[locale]}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
