import "server-only";
import { sanitizeCell } from "@/lib/exports/sanitize";
import type { CellValue } from "@/lib/exports/columns";

// CSV « Excel français » : séparateur « ; », décimales avec virgule, UTF-8 avec BOM.
export const CSV_SEPARATOR = ";";
export const CSV_BOM = "﻿";

function quote(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function csvCell(cell: CellValue): string {
  if (cell.kind === "amount") return cell.value.replace(".", ",");
  if (cell.kind === "date") return cell.value;
  return quote(sanitizeCell(cell.value));
}

export function csvLine(cells: CellValue[]): string {
  return cells.map(csvCell).join(CSV_SEPARATOR) + "\r\n";
}

export function csvHeader(headers: string[]): string {
  return headers.map((h) => quote(sanitizeCell(h))).join(CSV_SEPARATOR) + "\r\n";
}
