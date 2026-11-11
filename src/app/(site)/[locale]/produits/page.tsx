import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Check, MapPin, MessageCircle, PackageCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { isLocale, whatsappLink, type Locale } from "@/site/config";
import { PRODUCTS, type Availability, type Product } from "@/site/content/products";
import { StarMark, WhatsAppIcon } from "@/site/components/icons";
import { KasbahDivider } from "@/site/components/kasbah-divider";
import { PageHero } from "@/site/components/page-hero";
import { Reveal } from "@/site/components/reveal";
import { SectionHeading } from "@/site/components/section-heading";
import { getDictionary, type Dictionary } from "@/site/i18n";
import { getImage } from "@/site/images";
import { pageMetadata } from "@/site/seo";
import { btnOutline, btnPrimary, btnWhatsapp } from "@/site/styles";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.products;
  return pageMetadata({
    locale,
    path: "/produits",
    title: t.metaTitle,
    description: t.metaDescription,
    image: getImage("rose-damascena-gros-plan"),
  });
}

const AVAILABILITY_STYLE: Record<Availability, string> = {
  available: "bg-olive-soft text-olive",
  on_order: "bg-sand-deep text-forest",
  seasonal: "bg-blush-soft text-[#9b4f4f]",
  sold_out: "bg-stone/15 text-stone",
};

export default async function ProductsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.pages.products;

  return (
    <>
      <PageHero
        locale={locale}
        image={getImage("roses-champs-kelaa")}
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
        position="50% 55%"
      />

      {/* Sommaire : accès direct à chaque produit */}
      <nav aria-label={t.eyebrow} className="sticky top-18 z-20 border-b border-forest/10 bg-ivory/95 backdrop-blur lg:top-22">
        <ul className="container-site flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {PRODUCTS.map((p) => (
            <li key={p.slug} className="shrink-0">
              <a
                href={`#${p.slug}`}
                className="inline-flex rounded-full border border-forest/15 px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-saffron hover:bg-sand"
              >
                {p.name[locale]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-ivory">
        {PRODUCTS.map((product, i) => (
          <ProductSection key={product.slug} product={product} locale={locale} dict={dict} reversed={i % 2 === 1} />
        ))}
      </div>

      {/* Professionnels */}
      <section className="relative bg-forest py-24 text-ivory sm:py-28">
        <KasbahDivider id="products-pro" className="absolute inset-x-0 -top-3.5 text-forest" />
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <SectionHeading eyebrow={t.pro.eyebrow} title={t.pro.title} subtitle={t.pro.text} tone="light" />
          <div className="lg:justify-self-end">
            <a href={whatsappLink(t.pro.message)} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
              <MessageCircle className="size-4.5" aria-hidden />
              {t.pro.cta}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductSection({
  product,
  locale,
  dict,
  reversed,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  reversed: boolean;
}) {
  const t = dict.pages.products;
  const image = getImage(product.image);
  const other: Locale = locale === "fr" ? "ar" : "fr";
  const name = product.name[locale];

  return (
    <section
      id={product.slug}
      aria-labelledby={`${product.slug}-title`}
      className="scroll-mt-36 border-b border-forest/10 py-20 sm:py-28 lg:scroll-mt-40"
    >
      <div className="container-site grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className={cn("relative", reversed && "lg:order-2")}>
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-t-[999px] bg-sand-deep lg:max-w-none">
            <Image
              src={image.src}
              alt={image.alt[locale]}
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <StarMark className="absolute -bottom-4 start-1/2 size-9 -translate-x-1/2 text-saffron rtl:translate-x-1/2" />
        </Reveal>

        <Reveal delay={120}>
          <p lang={other} className={cn("text-saffron-deep", other === "ar" ? "font-[family-name:var(--font-naskh)] text-xl" : "eyebrow")}>
            {product.name[other]}
          </p>
          <h2 id={`${product.slug}-title`} className="display mt-2 text-[2.6rem] text-forest sm:text-6xl">
            {name}
          </h2>
          <p className="mt-2 font-[family-name:var(--font-cormorant-italic)] text-lg italic text-stone">{product.latin}</p>
          <p className="mt-6 text-[1.05rem] leading-[1.8] text-ink/75">{product.description[locale]}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoItem icon={MapPin} label={dict.common.origin} value={product.origin[locale]} />
            <InfoItem icon={CalendarDays} label={dict.common.season} value={product.season[locale]} />
            <div className="rounded-[2px] bg-sand p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold text-stone">
                <PackageCheck className="size-4 text-saffron" aria-hidden />
                {t.availabilityTitle}
              </dt>
              <dd className="mt-2">
                <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-semibold", AVAILABILITY_STYLE[product.availability])}>
                  {dict.common.availability[product.availability]}
                </span>
              </dd>
            </div>
          </dl>

          <h3 className="eyebrow mt-9 text-olive">{t.featuresTitle}</h3>
          <ul className="mt-4 space-y-2.5">
            {product.features[locale].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[0.98rem] text-ink/80">
                <Check className="mt-0.5 size-4.5 shrink-0 text-olive" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(t.orderMessage.replace("{product}", name))}
              target="_blank"
              rel="noopener noreferrer"
              className={btnWhatsapp}
            >
              <WhatsAppIcon className="size-5" />
              {dict.common.orderWhatsapp}
            </a>
            <a
              href={whatsappLink(dict.common.whatsappProductMessage(name))}
              target="_blank"
              rel="noopener noreferrer"
              className={btnOutline}
            >
              {dict.common.askInfo}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2px] bg-sand p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold text-stone">
        <Icon className="size-4 text-saffron" aria-hidden />
        {label}
      </dt>
      <dd className="mt-2 text-[0.95rem] font-medium text-forest">{value}</dd>
    </div>
  );
}
