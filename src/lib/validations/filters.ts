// Lecture tolérante des paramètres d'URL : une valeur invalide est ignorée,
// jamais propagée vers la base de données.
import {
  DEFAULT_PAGE_SIZE,
  OPERATION_TYPES,
  PAGE_SIZES,
  PERIOD_PRESETS,
  type OperationTypeValue,
  type PeriodPreset,
} from "@/lib/constants";
import { isValidIsoDate } from "@/lib/dates";
import { AMOUNT_REGEX, normalizeAmount } from "@/lib/money";
import { ID_REGEX } from "@/lib/validations/common";

export type SearchParams = Record<string, string | string[] | undefined>;

export const OPERATION_SORTS = ["date_desc", "date_asc", "amount_desc", "amount_asc"] as const;
export type OperationSort = (typeof OPERATION_SORTS)[number];

/** Critères de filtrage communs (listes, exports, dashboard). */
export type OperationCriteria = {
  type?: OperationTypeValue;
  q?: string;
  memberId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  min?: string;
  max?: string;
};

export type OperationListFilters = OperationCriteria & {
  sort: OperationSort;
  page: number;
  pageSize: number;
};

export function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  const value = Array.isArray(v) ? v[0] : v;
  return value?.trim() || undefined;
}

function pickEnum<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

function pickId(value: string | undefined): string | undefined {
  return value && ID_REGEX.test(value) ? value : undefined;
}

function pickDate(value: string | undefined): string | undefined {
  return value && isValidIsoDate(value) ? value : undefined;
}

function pickAmount(value: string | undefined): string | undefined {
  return value && AMOUNT_REGEX.test(value) ? normalizeAmount(value) : undefined;
}

export function parsePage(sp: SearchParams): number {
  const n = Number(first(sp, "page") ?? "1");
  return Number.isInteger(n) && n >= 1 && n <= 100_000 ? n : 1;
}

export function parsePageSize(sp: SearchParams, fallback: number = DEFAULT_PAGE_SIZE): number {
  const n = Number(first(sp, "pageSize"));
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : fallback;
}

export function parseSearch(sp: SearchParams): string | undefined {
  return first(sp, "q")?.slice(0, 100);
}

export function parseOperationCriteria(sp: SearchParams, forcedType?: OperationTypeValue): OperationCriteria {
  let from = pickDate(first(sp, "from"));
  let to = pickDate(first(sp, "to"));
  if (from && to && from > to) [from, to] = [to, from];
  return {
    type: forcedType ?? pickEnum(first(sp, "type"), OPERATION_TYPES),
    q: parseSearch(sp),
    memberId: pickId(first(sp, "member")),
    categoryId: pickId(first(sp, "category")),
    from,
    to,
    min: pickAmount(first(sp, "min")),
    max: pickAmount(first(sp, "max")),
  };
}

export function parseOperationListFilters(
  sp: SearchParams,
  forcedType?: OperationTypeValue,
): OperationListFilters {
  return {
    ...parseOperationCriteria(sp, forcedType),
    sort: pickEnum(first(sp, "sort"), OPERATION_SORTS) ?? "date_desc",
    page: parsePage(sp),
    pageSize: parsePageSize(sp),
  };
}

export function parsePeriodPreset(sp: SearchParams, fallback: PeriodPreset): PeriodPreset {
  return pickEnum(first(sp, "period"), PERIOD_PRESETS) ?? fallback;
}

export { pickEnum, pickId, pickDate };
