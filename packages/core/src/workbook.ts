import { read, utils } from "xlsx";
import { detectColumns, type PremiseField, REQUIRED_FIELDS } from "./columns";
import { normalizeRuc, RUC_ISSUE_MESSAGES } from "./ruc";
import type { PremiseInput } from "./schemas";

export type RowLevel = "ok" | "warning" | "error";

export interface ParsedRow {
  /** Row number as shown in Excel (1-based). */
  rowNumber: number;
  premise: Omit<PremiseInput, "ruc"> & { ruc: string | null };
  rawRuc: string;
  level: RowLevel;
  messages: string[];
}

export interface ParsedSheet {
  name: string;
  rows: ParsedRow[];
  missingColumns: PremiseField[];
}

const HEADER_SEARCH_ROWS = 10;

/** Reads every sheet of the workbook. Each sheet becomes a group. */
export function parseWorkbook(data: ArrayBuffer): ParsedSheet[] {
  const workbook = read(data, { type: "array", cellDates: false });
  const seen = new Set<string>();
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const matrix = sheet ? utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" }) : [];
    return parseSheet(name, matrix, seen);
  });
}

function parseSheet(name: string, matrix: unknown[][], seen: Set<string>): ParsedSheet {
  const headerIndex = matrix.slice(0, HEADER_SEARCH_ROWS).findIndex((row) => detectColumns(row).ruc !== undefined);
  if (headerIndex === -1) {
    return { name, rows: [], missingColumns: [...REQUIRED_FIELDS] };
  }

  const columns = detectColumns(matrix[headerIndex] ?? []);
  const missingColumns = REQUIRED_FIELDS.filter((field) => columns[field] === undefined);
  const cell = (row: unknown[], field: PremiseField) => {
    const index = columns[field];
    return index === undefined ? "" : row[index];
  };
  const text = (row: unknown[], field: PremiseField) => {
    const value = String(cell(row, field) ?? "").trim();
    return value === "" ? null : value;
  };

  const rows: ParsedRow[] = [];
  matrix.slice(headerIndex + 1).forEach((row, offset) => {
    if (row.every((value) => String(value).trim() === "")) return;

    const ruc = normalizeRuc(cell(row, "ruc"));
    const premise = {
      ruc: ruc.value,
      trade_name: text(row, "trade_name"),
      owner_name: text(row, "owner_name"),
      activity: text(row, "activity"),
      address: text(row, "address"),
      phone: text(row, "phone"),
      sector: text(row, "sector"),
      value: text(row, "value"),
    };
    const messages: string[] = [];
    let level: RowLevel = "ok";

    if (ruc.issue) {
      messages.push(RUC_ISSUE_MESSAGES[ruc.issue]);
      level = ruc.value ? "warning" : "error";
    }
    if (!premise.address) {
      messages.push("Falta la dirección.");
      if (level === "ok") level = "warning";
    }

    const key = [premise.ruc, premise.trade_name, premise.address].join("|").toLowerCase();
    if (premise.ruc && seen.has(key)) {
      messages.push("Fila duplicada: se omitirá.");
      level = "error";
    }
    seen.add(key);

    rows.push({
      rowNumber: headerIndex + offset + 2,
      premise,
      rawRuc: String(cell(row, "ruc")),
      level,
      messages,
    });
  });

  return { name, rows, missingColumns };
}
