import "server-only";
import { PassThrough } from "node:stream";
import * as ExcelJS from "exceljs";
import { sanitizeCell } from "@/lib/exports/sanitize";
import type { CellValue } from "@/lib/exports/columns";

export const MONEY_FORMAT = '#,##0.00 "MAD"';

/** Classeur Excel écrit en flux : les lignes ne sont jamais toutes gardées en mémoire. */
export function createStreamingWorkbook() {
  const stream = new PassThrough();
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream,
    useStyles: true,
    useSharedStrings: false,
  });
  workbook.creator = "FarmShare";
  workbook.created = new Date();
  return { workbook, stream };
}

/** Valeur de cellule Excel : les textes restent des chaînes (jamais des formules). */
export function xlsxValue(cell: CellValue): string | number | Date {
  if (cell.kind === "amount") return Number(cell.value);
  if (cell.kind === "date") return new Date(`${cell.value}T00:00:00.000Z`);
  return sanitizeCell(cell.value);
}
