import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { CONTACT, isLocale, whatsappLink } from "@/site/config";
import { PRODUCTS } from "@/site/content/products";
import { WhatsAppIcon } from "@/site/components/icons";
import { MapEmbed, googleMapsUrl } from "@/site/components/map-embed";
import { PageHero } from "@/site/components/page-hero";
import { Reveal } from "@/site/components/reveal";
import { SectionHeading } from "@/site/components/section-heading";
import { WhatsAppForm } from "@/site/components/whatsapp-form";
import { getDictionary } from "@/site/i18n";
import { getImage } from "@/site/images";
import { pageMetadata } from "@/site/seo";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.contact;
  return pageMetadata({
    locale,
    path: "/contact",
    title: t.metaTitle,
    description: t.metaDescription,
    image: getImage("paysage-vallee-oasis-atlas"),
  });
}

export default async function ContactPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.contact;
  const socials = Object.entries(CONTACT.socials).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <>
      <PageHero
        locale={locale}
        image={getImage("paysage-vallee-oasis-atlas")}
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
      />

      <section className="bg-ivory py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Coordonnées */}
          <div className="space-y-4 lg:col-span-5">
            <Reveal>
              <a
                href={whatsappLink(dict.common.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-[2px] bg-forest p-6 text-ivory transition-colors hover:bg-[#2e4a34] sm:p-8"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
                  <WhatsAppIcon className="size-7" />
                </span>
                <span>
                  <span className="display block text-3xl">{t.whatsappTitle}</span>
                  <span className="mt-1 block text-[0.95rem] text-ivory/70">{t.whatsappText}</span>
                  <span dir="ltr" className="mt-2 block font-semibold text-saffron">
                    {CONTACT.phoneDisplay}
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={80}>
              <a href={CONTACT.phoneHref} className="flex items-center gap-5 rounded-[2px] bg-sand p-6 transition-colors hover:bg-sand-deep">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-saffron text-saffron-deep">
                  <Phone className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-stone">{t.phoneTitle}</span>
                  <span dir="ltr" className="display mt-0.5 block text-2xl text-forest">
                    {CONTACT.phoneDisplay}
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={160}>
              <div className="flex items-start gap-5 rounded-[2px] bg-sand p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-saffron text-saffron-deep">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-stone">{t.addressTitle}</span>
                  <span className="mt-1 block text-forest">{CONTACT.address[locale]}</span>
                  <a
                    href={googleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-olive hover:text-forest"
                  >
                    {t.openMap}
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                </span>
              </div>
            </Reveal>

            {socials.length > 0 && (
              <ul className="flex gap-3 pt-2">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border border-forest/15 px-4 py-2 text-sm font-medium capitalize text-forest hover:bg-sand"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Formulaire → WhatsApp */}
          <Reveal delay={120} className="rounded-[2px] border border-forest/10 bg-sand/60 p-6 sm:p-10 lg:col-span-7">
            <SectionHeading eyebrow={t.whatsappTitle} title={t.form.title} subtitle={t.form.text} />
            <div className="mt-10">
              <WhatsAppForm
                labels={t.form}
                products={PRODUCTS.map((p) => p.name[locale])}
                whatsappNumber={CONTACT.whatsappNumber}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Carte */}
      <section className="bg-sand pb-24 pt-4 sm:pb-28">
        <div className="container-site">
          <h2 className="display mb-8 text-4xl text-forest">{t.mapTitle}</h2>
          <MapEmbed title={t.mapTitle} className="aspect-[4/3] sm:aspect-[21/9]" />
        </div>
      </section>
    </>
  );
}
