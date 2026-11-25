import { describe, expect, it } from "vitest";
import { read, utils } from "xlsx";
import { buildReportWorkbook, type ReportRow, summarize } from "./report";

const row = (overrides: Partial<ReportRow>): ReportRow => ({
  ruc: "1800000000001",
  trade_name: "Local",
  owner_name: null,
  activity: null,
  address: null,
  phone: null,
  value: null,
  status: null,
  registration_number: null,
  notes: null,
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
  });

  it("keeps the source columns and adds registration number and observations", () => {
    const book = read(
      buildReportWorkbook("Informe", [
        {
          name: "Grupo 1",
          rows: [row({ value: "25.5", status: "operating_with_permit", registration_number: "AMB-1", notes: "Atendió el dueño" })],
        },
      ]),
    );
    const detail = utils.sheet_to_json<unknown[]>(book.Sheets["Detalle"]!, { header: 1 });
    expect(detail[0]).toEqual([
      "RUC", "TIPO_ESTABLECIMIENTO", "NOMBRE_COMERCIAL", "REPRESENTANTE_LEGAL", "DIRECCION",
      "TELEFONO", "VALOR", "NUMERO_FUNCIONAMIENTO", "OBSERVACIONES",
    ]);
    expect(detail[1]?.slice(6)).toEqual(["25.5", "AMB-1", "Funciona con permiso. Atendió el dueño"]);
  });
});
