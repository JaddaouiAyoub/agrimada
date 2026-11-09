import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { APP_NAME, DATE_FORMATS, DEFAULT_TIMEZONE, type DateFormatValue } from "@/lib/constants";
import { dbDateToIso } from "@/lib/dates";

export type AppSettings = {
  farmName: string;
  description: string | null;
  currency: string;
  timezone: string;
  dateFormat: DateFormatValue;
  lockedUntil: string | null;
  /** Catégorie présélectionnée pour une cotisation (peut être devenue inactive). */
  defaultContributionCategoryId: string | null;
  /** Catégorie des cotisations générées par les achats payés avec l'argent personnel d'un membre. */
  advanceContributionCategoryId: string | null;
  initialized: boolean;
};

export const getSettings = cache(async (): Promise<AppSettings> => {
  const s = await db.farmSettings.findUnique({ where: { id: 1 } });
  const dateFormat = (DATE_FORMATS as readonly string[]).includes(s?.dateFormat ?? "")
    ? (s?.dateFormat as DateFormatValue)
    : "dd/MM/yyyy";
  return {
    farmName: s?.farmName ?? APP_NAME,
    description: s?.description ?? null,
    currency: s?.currency ?? "MAD",
    timezone: s?.timezone ?? DEFAULT_TIMEZONE,
    dateFormat,
    lockedUntil: s?.lockedUntil ? dbDateToIso(s.lockedUntil) : null,
    defaultContributionCategoryId: s?.defaultContributionCategoryId ?? null,
    advanceContributionCategoryId: s?.advanceContributionCategoryId ?? null,
    initialized: Boolean(s),
  };
});
