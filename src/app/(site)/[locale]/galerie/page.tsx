import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/site/config";
import { GalleryGrid, type GalleryItem } from "@/site/components/gallery-grid";
import { PageHero } from "@/site/components/page-hero";
import { getDictionary } from "@/site/i18n";
import { GALLERY_ORDER, getImage } from "@/site/images";
import { pageMetadata } from "@/site/seo";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pages.gallery;
  return pageMetadata({
    locale,
    path: "/galerie",
    title: t.metaTitle,
    description: t.metaDescription,
    image: getImage("roses-petales-tapis"),
  });
}

export default async function GalleryPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).pages.gallery;

  const items: GalleryItem[] = GALLERY_ORDER.map((key) => {
    const image = getImage(key);
    return { key, src: image.src, alt: image.alt[locale], categories: image.categories };
  });

  return (
    <>
      <PageHero
        locale={locale}
        image={getImage("roses-petales-tapis")}
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.subtitle}
      />
      <section className="bg-ivory py-16 sm:py-24">
        <div className="container-site">
          <GalleryGrid
            items={items}
            rtl={locale === "ar"}
            labels={{
              filterLabel: t.filterLabel,
              all: t.all,
              categories: t.categories,
              open: t.open,
              close: t.close,
              prev: t.prev,
              next: t.next,
              counter: t.counter,
            }}
          />
        </div>
      </section>
    </>
  );
}
