import type { Locale } from "@/site/config";
import { ar } from "./ar";
import { fr, type Dictionary } from "./fr";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
