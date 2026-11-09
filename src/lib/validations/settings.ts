import { z } from "zod";
import { DATE_FORMATS } from "@/lib/constants";
import { isValidIsoDate } from "@/lib/dates";
import { ID_REGEX } from "@/lib/validations/common";

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const settingsSchema = z.object({
  farmName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(120),
  description: z.string().trim().max(1000, "1000 caractères maximum"),
  timezone: z.string().refine(isValidTimeZone, "Fuseau horaire invalide"),
  dateFormat: z.enum(DATE_FORMATS),
  lockedUntil: z.union([z.literal(""), z.string().refine(isValidIsoDate, "Date invalide")]),
  defaultContributionCategoryId: z.union([z.literal(""), z.string().regex(ID_REGEX, "Catégorie invalide")]),
});
export type SettingsValues = z.infer<typeof settingsSchema>;
