"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isLocale } from "@/site/config";
import { StarMark } from "@/site/components/icons";
import { getDictionary } from "@/site/i18n";

// Page introuvable du site, dans la langue de l'adresse et avec l'identité visuelle Agrimada.
export default function SiteNotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale && isLocale(params.locale) ? params.locale : "fr";
  const t = getDictionary(locale).notFound;

  return (
    <section className="flex min-h-[80svh] items-center bg-sand pt-28 pb-20">
      <div className="container-site max-w-2xl text-center">
        <StarMark className="mx-auto size-6 text-saffron" />
        <p className="display mt-6 text-7xl text-forest/20">404</p>
        <h1 className="display mt-2 text-4xl text-forest sm:text-5xl">{t.title}</h1>
        <p className="mt-5 text-stone">{t.text}</p>
        <Link
          href={`/${locale}`}
          className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-forest px-7 py-3.5 font-semibold text-ivory transition-colors hover:bg-olive"
        >
          {t.back}
          <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
