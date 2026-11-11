import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/site/config";
import { SectionHeading } from "@/site/components/section-heading";
import { getDictionary } from "@/site/i18n";
import { IMAGES } from "@/site/images";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getDictionary(locale).credits.title,
    alternates: { canonical: `/${locale}/credits`, languages: { fr: "/fr/credits", ar: "/ar/credits" } },
  };
}

export default async function CreditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).credits;
  const credited = Object.values(IMAGES).flatMap((image) => ("credit" in image ? [{ ...image.credit, alt: image.alt[locale] }] : []));

  return (
    <section className="bg-ivory pt-36 pb-24 sm:pt-44">
      <div className="container-site max-w-4xl">
        <SectionHeading eyebrow="Agrimada" title={t.title} subtitle={t.intro} />
        <ul className="mt-14 divide-y divide-forest/10 border-y border-forest/10">
          {credited.map((c) => (
            <li key={c.source} className="grid gap-2 py-5 text-[0.95rem] sm:grid-cols-[1.3fr_1fr_auto] sm:items-center sm:gap-6">
              <span className="font-medium text-forest">{c.alt}</span>
              <span className="text-stone">
                {t.author} : {c.author} · {t.license} : {c.license}
              </span>
              <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-olive underline-offset-4 hover:underline">
                {t.source}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
