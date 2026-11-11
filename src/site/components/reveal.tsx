"use client";

import * as React from "react";

/**
 * Fait apparaître doucement son contenu lorsqu'il entre dans l'écran.
 * Rendu serveur : contenu visible. Seuls les éléments situés sous la ligne de
 * flottaison sont masqués puis révélés (aucun clignotement, rien de caché sans JS).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Délai en millisecondes (effet de cascade). */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "figure";
}) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return React.createElement(
    Tag,
    {
      ref,
      className,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
