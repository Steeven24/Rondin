import { describe, expect, it } from "vitest";
import { read, utils } from "xlsx";
import { buildReportWorkbook, type ReportRow, summarize } from "./report";

const row = (overrides: Partial<ReportRow>): ReportRow => ({
  ruc: "1800000000001",
  trade_name: "Local",
  owner_name: null,
  activity: null,
  address: null,
  status: null,
  registration_number: null,
  notes: null,
  visited_by: null,
  visited_at: null,
  ...overrides,
});

describe("report", () => {
  it("summarizes counts and percentages by status", () => {
    const summary = summarize([row({ status: "operating_with_permit" }), row({})]);
    expect(summary[0]).toEqual(["Funciona con permiso", 1, 50]);
    expect(summary.at(-2)).toEqual(["Pendiente", 1, 50]);
    expect(summary.at(-1)).toEqual(["Total", 2, 100]);
  });

  it("builds a summary and a detail sheet for one group", () => {
    const book = read(buildReportWorkbook("Informe", [{ name: "Grupo 1", rows: [row({})] }]));
    expect(book.SheetNames).toEqual(["Resumen", "Detalle"]);
  });

  it("builds one sheet per group for the consolidated report", () => {
    const book = read(
      buildReportWorkbook("Consolidado", [
        { name: "Grupo 1", rows: [row({ status: "not_found" })] },
        { name: "Grupo 2", rows: [row({})] },
      ]),
    );
    expect(book.SheetNames).toEqual(["Resumen", "Grupo 1", "Grupo 2"]);
    const detail = utils.sheet_to_json<unknown[]>(book.Sheets["Grupo 1"]!, { header: 1 });
    expect(detail[1]?.[6]).toBe("No existe o ya no funciona");
  });
});
