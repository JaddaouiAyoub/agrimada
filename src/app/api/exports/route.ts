import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { OPERATION_TYPE_LABELS, PERIOD_LABELS, type OperationTypeValue } from "@/lib/constants";
import { formatRangeLabel, resolvePeriod, todayInTimeZone, type DateRange } from "@/lib/dates";
import { OPERATION_EXPORT_COLUMNS, type CellValue } from "@/lib/exports/columns";
import { CSV_BOM, csvHeader, csvLine } from "@/lib/exports/csv";
import { MONEY_FORMAT, createStreamingWorkbook, xlsxValue } from "@/lib/exports/xlsx";
import { canExport } from "@/lib/permissions";
import {
  first,
  parseOperationCriteria,
  parsePeriodPreset,
  pickDate,
  pickEnum,
  type OperationCriteria,
  type SearchParams,
} from "@/lib/validations/filters";
import { writeAudit } from "@/server/audit";
import { iterateOperationsForExport } from "@/server/queries/operations";
import { getFinancialSummary } from "@/server/services/finance";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

const DATASETS = ["operations", "expenses", "revenues", "contributions", "summary"] as const;
type Dataset = (typeof DATASETS)[number];
const FORMATS = ["csv", "xlsx"] as const;
type Format = (typeof FORMATS)[number];

const DATASET_SLUGS: Record<Dataset, string> = {
  operations: "operations",
  expenses: "depenses",
  revenues: "revenus",
  contributions: "cotisations",
  summary: "bilan",
};

function periodSlug(range: DateRange): string {
  if (range.from && range.to) {
    const sameMonth = range.from.slice(0, 7) === range.to.slice(0, 7);
    const fullMonth = sameMonth && range.from.endsWith("-01");
    if (fullMonth) return range.from.slice(0, 7);
    if (range.from.slice(0, 4) === range.to.slice(0, 4) && range.from.endsWith("-01-01") && range.to.endsWith("-12-31")) {
      return range.from.slice(0, 4);
    }
    return `${range.from}_${range.to}`;
  }
  if (range.from) return `depuis-${range.from}`;
  if (range.to) return `jusqu-au-${range.to}`;
  return "complet";
}

function contentHeaders(format: Format, filename: string): HeadersInit {
  return {
    "Content-Type":
      format === "csv"
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

// ---------------------------------------------------------------------------
// Opérations (flux par lots)
// ---------------------------------------------------------------------------

function streamOperationsCsv(criteria: OperationCriteria): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const iterator = iterateOperationsForExport(criteria);
  let headerSent = false;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (!headerSent) {
          headerSent = true;
          controller.enqueue(encoder.encode(CSV_BOM + csvHeader(OPERATION_EXPORT_COLUMNS.map((c) => c.header))));
          return;
        }
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        let chunk = "";
        for (const row of value) chunk += csvLine(OPERATION_EXPORT_COLUMNS.map((c) => c.get(row)));
        controller.enqueue(encoder.encode(chunk));
      } catch (error) {
        console.error("[export] CSV", error);
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return(undefined);
    },
  });
}

function applyCellFormats(row: { getCell: (i: number) => { numFmt: string } }, cells: CellValue[]) {
  cells.forEach((cell, i) => {
    if (cell.kind === "amount") row.getCell(i + 1).numFmt = MONEY_FORMAT;
    if (cell.kind === "date") row.getCell(i + 1).numFmt = "dd/mm/yyyy";
  });
}

function streamOperationsXlsx(criteria: OperationCriteria, sheetName: string): ReadableStream<Uint8Array> {
  const { workbook, stream } = createStreamingWorkbook();
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = OPERATION_EXPORT_COLUMNS.map((c) => ({ width: c.width }));

  void (async () => {
    try {
      const header = sheet.addRow(OPERATION_EXPORT_COLUMNS.map((c) => c.header));
      header.font = { bold: true };
      header.commit();
      for await (const batch of iterateOperationsForExport(criteria)) {
        for (const op of batch) {
          const cells = OPERATION_EXPORT_COLUMNS.map((c) => c.get(op));
          const row = sheet.addRow(cells.map(xlsxValue));
          applyCellFormats(row, cells);
          row.commit();
        }
      }
      sheet.commit();
      await workbook.commit();
    } catch (error) {
      console.error("[export] XLSX", error);
      stream.destroy(error instanceof Error ? error : new Error("Export impossible"));
    }
  })();

  return Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
}

// ---------------------------------------------------------------------------
// Bilan financier (petit volume : construit en mémoire)
// ---------------------------------------------------------------------------

type Section = { title: string; headers: string[]; rows: CellValue[][] };

async function buildSummarySections(criteria: OperationCriteria, periodLabel: string): Promise<Section[]> {
  const summary = await getFinancialSummary(criteria);
  const t = (value: string): CellValue => ({ kind: "text", value });
  const a = (value: string): CellValue => ({ kind: "amount", value });
  const breakdown = (type: OperationTypeValue, items: { name: string; total: string }[]): Section => ({
    title: `${OPERATION_TYPE_LABELS[type]}s par catégorie`,
    headers: ["Catégorie", "Montant"],
    rows: items.map((i) => [t(i.name), a(i.total)]),
  });
  return [
    {
      title: `Bilan financier — ${periodLabel}`,
      headers: ["Indicateur", "Valeur"],
      rows: [
        [t("Revenus de la ferme (cotisations comprises)"), a(summary.totals.revenue)],
        [t("dont cotisations"), a(summary.contributions)],
        [t("Dépenses de la ferme"), a(summary.totals.expense)],
        [t("Résultat de la période (revenus − dépenses, hors trésorerie)"), a(summary.totals.result)],
        [t("Nombre d'opérations"), t(String(summary.totals.count))],
      ],
    },
    breakdown("EXPENSE", summary.expensesByCategory),
    breakdown("REVENUE", summary.revenuesByCategory),
    {
      title: "Résumé par membre (montants bruts, hors remboursements)",
      headers: [
        "Membre",
        "Dépenses payées",
        "dont avances personnelles à rembourser (hors cotisations)",
        "Revenus encaissés",
        "dont cotisations versées",
        "dont conservés par le membre",
        "Opérations",
      ],
      rows: summary.members.map((m) => [
        t(m.name),
        a(m.expensesPaid),
        a(m.advances),
        a(m.revenuesReceived),
        a(m.contributionsPaid),
        a(m.heldFunds),
        t(String(m.operationsCount)),
      ]),
    },
  ];
}

function summaryCsv(sections: Section[]): string {
  let out = CSV_BOM;
  for (const s of sections) {
    out += csvHeader([s.title]);
    out += csvHeader(s.headers);
    for (const row of s.rows) out += csvLine(row);
    out += "\r\n";
  }
  return out;
}

function summaryXlsx(sections: Section[]): ReadableStream<Uint8Array> {
  const { workbook, stream } = createStreamingWorkbook();
  const sheet = workbook.addWorksheet("Bilan");
  sheet.columns = [{ width: 58 }, { width: 18 }, { width: 24 }, { width: 18 }, { width: 24 }, { width: 26 }, { width: 12 }];
  void (async () => {
    try {
      for (const s of sections) {
        const title = sheet.addRow([s.title]);
        title.font = { bold: true, size: 12 };
        title.commit();
        const header = sheet.addRow(s.headers);
        header.font = { bold: true };
        header.commit();
        for (const cells of s.rows) {
          const row = sheet.addRow(cells.map(xlsxValue));
          applyCellFormats(row, cells);
          row.commit();
        }
        sheet.addRow([]).commit();
      }
      sheet.commit();
      await workbook.commit();
    } catch (error) {
      console.error("[export] bilan XLSX", error);
      stream.destroy(error instanceof Error ? error : new Error("Export impossible"));
    }
  })();
  return Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
}

// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!canExport(user)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const sp = Object.fromEntries(request.nextUrl.searchParams) as SearchParams;
  const dataset: Dataset = pickEnum(first(sp, "dataset"), DATASETS) ?? "operations";
  const format: Format = pickEnum(first(sp, "format"), FORMATS) ?? "xlsx";

  const settings = await getSettings();
  const preset = parsePeriodPreset(sp, "all");
  const range = resolvePeriod(preset, todayInTimeZone(settings.timezone), {
    from: pickDate(first(sp, "from")),
    to: pickDate(first(sp, "to")),
  });
  const forcedType: OperationTypeValue | undefined =
    dataset === "expenses" ? "EXPENSE" : dataset === "revenues" || dataset === "contributions" ? "REVENUE" : undefined;
  // Même découpage que les pages : « Revenus » hors cotisations, « Cotisations » seules.
  const isContribution = dataset === "contributions" ? true : dataset === "revenues" ? false : undefined;
  const criteria: OperationCriteria = {
    ...parseOperationCriteria(sp, forcedType),
    isContribution,
    from: range.from,
    to: range.to,
  };

  const filename = `farmshare-${DATASET_SLUGS[dataset]}-${periodSlug(range)}.${format}`;
  const periodLabel =
    preset === "custom" || preset === "all"
      ? formatRangeLabel(range, settings.dateFormat)
      : `${PERIOD_LABELS[preset]} (${formatRangeLabel(range, settings.dateFormat)})`;

  // Les exports sont tracés (qui a exporté quoi) — sans les données elles-mêmes.
  await writeAudit(db, {
    actorId: user.id,
    action: "export.download",
    entityType: "Operation",
    entityId: null,
    metadata: { dataset, format, from: range.from ?? null, to: range.to ?? null },
  });

  if (dataset === "summary") {
    const sections = await buildSummarySections(criteria, periodLabel);
    const body = format === "csv" ? summaryCsv(sections) : summaryXlsx(sections);
    return new Response(body, { headers: contentHeaders(format, filename) });
  }

  const sheetName =
    dataset === "expenses"
      ? "Dépenses"
      : dataset === "revenues"
        ? "Revenus"
        : dataset === "contributions"
          ? "Cotisations"
          : "Opérations";
  const body = format === "csv" ? streamOperationsCsv(criteria) : streamOperationsXlsx(criteria, sheetName);
  return new Response(body, { headers: contentHeaders(format, filename) });
}
