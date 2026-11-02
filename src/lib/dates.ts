// Dates métier : chaînes ISO "YYYY-MM-DD" (sans heure). En base, colonne DATE ;
// côté JS, minuit UTC. Tous les calculs de période se font sur ces chaînes,
// sans dépendre du fuseau du serveur.
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PeriodPreset } from "@/lib/constants";

export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isoToDbDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function dbDateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y ?? 1970, m ?? 1, d ?? 1];
}

function fromUtc(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = parts(iso);
  return fromUtc(y, m, d + days);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((isoToDbDate(to).getTime() - isoToDbDate(from).getTime()) / 86_400_000);
}

/** Date du jour dans le fuseau de la ferme. */
export function todayInTimeZone(timeZone: string): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function startOfMonth(iso: string): string {
  const [y, m] = parts(iso);
  return fromUtc(y, m, 1);
}

export function endOfMonth(iso: string): string {
  const [y, m] = parts(iso);
  return fromUtc(y, m + 1, 0);
}

export type DateRange = { from?: string; to?: string };

/** Résout un préréglage de période (semaine commençant le lundi). */
export function resolvePeriod(
  preset: PeriodPreset,
  today: string,
  custom: DateRange = {},
): DateRange {
  const [y, m] = parts(today);
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const dow = (isoToDbDate(today).getUTCDay() + 6) % 7; // lundi = 0
      const from = addDays(today, -dow);
      return { from, to: addDays(from, 6) };
    }
    case "month":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "quarter": {
      const qStart = Math.floor((m - 1) / 3) * 3 + 1;
      return { from: fromUtc(y, qStart, 1), to: fromUtc(y, qStart + 3, 0) };
    }
    case "year":
      return { from: fromUtc(y, 1, 1), to: fromUtc(y, 12, 31) };
    case "custom":
      return { from: custom.from, to: custom.to };
    case "all":
    default:
      return {};
  }
}

/** Période précédente de même durée, immédiatement antérieure. */
export function previousRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const length = daysBetween(range.from, range.to) + 1;
  const to = addDays(range.from, -1);
  return { from: addDays(to, -(length - 1)), to };
}

/** Formate une date ISO "YYYY-MM-DD" selon le motif choisi dans les paramètres. */
export function formatDate(iso: string, pattern = "dd/MM/yyyy"): string {
  const [y, m, d] = parts(iso);
  return format(new Date(y, m - 1, d), pattern, { locale: fr });
}

/** Horodatage (createdAt, audit…) affiché dans le fuseau de la ferme. */
export function formatDateTime(date: Date | string, timeZone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatMonthLabel(monthIso: string): string {
  const [y, m] = parts(`${monthIso}-01`);
  return format(new Date(y, m - 1, 1), "MMM yyyy", { locale: fr });
}

export function formatRangeLabel(range: DateRange, pattern = "dd/MM/yyyy"): string {
  if (range.from && range.to) {
    return range.from === range.to
      ? formatDate(range.from, pattern)
      : `du ${formatDate(range.from, pattern)} au ${formatDate(range.to, pattern)}`;
  }
  if (range.from) return `depuis le ${formatDate(range.from, pattern)}`;
  if (range.to) return `jusqu'au ${formatDate(range.to, pattern)}`;
  return "toute la période";
}
