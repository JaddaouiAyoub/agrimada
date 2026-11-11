"use client";

import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryCategory } from "@/site/images";

export type GalleryItem = {
  key: string;
  src: StaticImageData;
  alt: string;
  categories: GalleryCategory[];
};

type Labels = {
  filterLabel: string;
  all: string;
  categories: Record<GalleryCategory, string>;
  open: string;
  close: string;
  prev: string;
  next: string;
  counter: string;
};

const CATEGORY_ORDER: GalleryCategory[] = ["ferme", "roses", "safran", "oliviers", "amandiers", "recoltes"];

export function GalleryGrid({ items, labels, rtl }: { items: GalleryItem[]; labels: Labels; rtl: boolean }) {
  const [filter, setFilter] = React.useState<GalleryCategory | "all">("all");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const visible = React.useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.categories.includes(filter))),
    [items, filter],
  );

  return (
    <>
      <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2">
        {(["all", ...CATEGORY_ORDER] as const).map((cat) => {
          const active = filter === cat;
          const count = cat === "all" ? items.length : items.filter((i) => i.categories.includes(cat)).length;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(cat)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active ? "border-forest bg-forest text-ivory" : "border-forest/15 text-forest hover:border-saffron hover:bg-sand",
              )}
            >
              {cat === "all" ? labels.all : labels.categories[cat]}
              <span className={cn("text-xs tabular-nums", active ? "text-ivory/60" : "text-stone")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mosaïque en colonnes : chaque photo garde ses proportions. */}
      <ul className="mt-10 columns-2 gap-3 sm:gap-4 lg:columns-3">
        {visible.map((item, index) => (
          <li key={item.key} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`${labels.open} : ${item.alt}`}
              className="group relative block w-full overflow-hidden rounded-[2px] bg-sand-deep"
            >
              <Image
                src={item.src}
                alt={item.alt}
                placeholder="blur"
                sizes="(min-width: 1024px) 31vw, 48vw"
                className="h-auto w-full transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-forest-deep/80 to-transparent p-4 pt-10 text-start text-sm text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                {item.alt}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && visible[openIndex] && (
        <Lightbox
          items={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          labels={labels}
          rtl={rtl}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
  labels,
  rtl,
}: {
  items: GalleryItem[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  labels: Labels;
  rtl: boolean;
}) {
  const item = items[index];
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const touchStart = React.useRef<number | null>(null);
  const total = items.length;
  const go = React.useCallback((delta: number) => onIndexChange((index + delta + total) % total), [index, total, onIndexChange]);

  React.useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Le focus reste dans la visionneuse tant qu'elle est ouverte.
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button")).filter(
          (el) => el.offsetParent !== null,
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      // En arabe, la flèche gauche mène à la photo suivante (sens de lecture).
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose, rtl]);

  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      className="fixed inset-0 z-50 flex flex-col bg-forest-deep/96 text-ivory backdrop-blur-sm"
      onTouchStart={(e) => (touchStart.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const end = e.changedTouches[0]?.clientX;
        touchStart.current = null;
        if (start === null || end === undefined || Math.abs(end - start) < 50) return;
        const towardStart = end < start; // glissement vers la gauche
        go(towardStart !== rtl ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-sm text-ivory/70 tabular-nums" aria-live="polite">
          {labels.counter.replace("{current}", String(index + 1)).replace("{total}", String(total))}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="inline-flex size-11 items-center justify-center rounded-full hover:bg-ivory/10"
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20" onClick={onClose}>
        <div className="relative size-full" onClick={(e) => e.stopPropagation()}>
          <Image
            key={item.key}
            src={item.src}
            alt={item.alt}
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label={labels.prev}
          className="absolute start-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 hover:bg-ivory/20 sm:inline-flex"
        >
          <ChevronLeft className="size-6 rtl:-scale-x-100" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label={labels.next}
          className="absolute end-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 hover:bg-ivory/20 sm:inline-flex"
        >
          <ChevronRight className="size-6 rtl:-scale-x-100" />
        </button>
      </div>

      <p className="px-6 py-5 text-center text-sm text-ivory/80">{item.alt}</p>
    </div>
  );
}
