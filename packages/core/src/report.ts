import { utils, type WorkBook, write } from "xlsx";
import { VISIT_STATUS_LABELS, VISIT_STATUSES, type VisitStatus } from "./constants";

export interface ReportRow {
  ruc: string;
  trade_name: string | null;
  owner_name: string | null;
  activity: string | null;
  address: string | null;
  phone: string | null;
  value: string | null;
  status: VisitStatus | null;
  registration_number: string | null;
  notes: string | null;
  /** Link to the evidence page in the app (requires signing in); null when not visited. */
  evidence_url?: string | null;
}

export interface ReportGroup {
  name: string;
  rows: ReportRow[];
}

/** Same columns as the source Excel, plus the ones filled in during the visits. */
const DETAIL_HEADER = [
  "RUC", "TIPO_ESTABLECIMIENTO", "NOMBRE_COMERCIAL", "REPRESENTANTE_LEGAL", "DIRECCION",
  "TELEFONO", "VALOR", "NUMERO_FUNCIONAMIENTO", "OBSERVACIONES", "EVIDENCIA",
];
const EVIDENCE_COLUMN = DETAIL_HEADER.indexOf("EVIDENCIA");

/** Observation text: the visit result followed by the member's notes. */
export function observationText(row: Pick<ReportRow, "status" | "notes">): string {
  const status = row.status ? VISIT_STATUS_LABELS[row.status] : "Pendiente de visita";
  return row.notes ? `${status}. ${row.notes}` : status;
}

function detailRows(rows: ReportRow[]) {
  return rows.map((r) => [
    r.ruc, r.activity ?? "", r.trade_name ?? "", r.owner_name ?? "", r.address ?? "",
    r.phone ?? "", r.value ?? "", r.registration_number ?? "", observationText(r),
    r.evidence_url ? "Ver evidencia" : "",
  ]);
}

/** Counts per status, plus pending premises, with their percentage of the total. */
export function summarize(rows: ReportRow[]) {
  const total = rows.length;
  const line = (label: string, n: number) => [label, n, total ? Math.round((n / total) * 1000) / 10 : 0];
  return [
    ...VISIT_STATUSES.map((s) => line(VISIT_STATUS_LABELS[s], rows.filter((r) => r.status === s).length)),
    line("Pendiente", rows.filter((r) => !r.status).length),
    ["Total", total, 100],
  ];
}

function detailSheet(rows: ReportRow[]) {
  const sheet = utils.aoa_to_sheet([DETAIL_HEADER, ...detailRows(rows)]);
  // "Ver evidencia" cells become clickable links to the app.
  rows.forEach((row, i) => {
    const cell = sheet[utils.encode_cell({ r: i + 1, c: EVIDENCE_COLUMN })];
    if (cell && row.evidence_url) cell.l = { Target: row.evidence_url };
  });
  sheet["!cols"] = DETAIL_HEADER.map((h) => ({ wch: Math.max(12, h.length + 2) }));
  sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1" };
  return sheet;
}

/** Sheet names: max 31 chars and no []:*?/\ characters. */
function safeSheetName(name: string, used: Set<string>) {
  const base = name.replace(/[[\]:*?/\\]/g, " ").slice(0, 28) || "Grupo";
  let candidate = base;
  for (let i = 2; used.has(candidate); i++) candidate = `${base} ${i}`;
  used.add(candidate);
  return candidate;
}

/**
 * Group report: summary sheet + detail sheet.
 * Consolidated report (several groups): general summary by group + one detail sheet per group.
 */
export function buildReportWorkbook(title: string, groups: ReportGroup[]): ArrayBuffer {
  const workbook: WorkBook = utils.book_new();
  const used = new Set<string>(["Resumen"]);
  const all = groups.flatMap((g) => g.rows);

  const summary: unknown[][] = [[title], [], ["Estado", "Locales", "%"], ...summarize(all)];
  if (groups.length > 1) {
    summary.push([], ["Grupo", "Locales", "Visitados", "Con permiso", "Avance %"]);
    for (const g of groups) {
      const visited = g.rows.filter((r) => r.status).length;
      const withPermit = g.rows.filter((r) => r.status === "operating_with_permit").length;
      summary.push([g.name, g.rows.length, visited, withPermit, g.rows.length ? Math.round((visited / g.rows.length) * 100) : 0]);
    }
  }
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(summary), "Resumen");

  if (groups.length === 1) {
    utils.book_append_sheet(workbook, detailSheet(all), "Detalle");
  } else {
    for (const g of groups) utils.book_append_sheet(workbook, detailSheet(g.rows), safeSheetName(g.name, used));
  }

  return write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
