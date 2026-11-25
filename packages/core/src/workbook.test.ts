import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { parseWorkbook } from "./workbook";

function buildWorkbook(sheets: Record<string, unknown[][]>): ArrayBuffer {
  const workbook = utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), name);
  }
  return write(workbook, { type: "array", bookType: "xlsx" });
}

const HEADER = ["RUC", "Actividad", "Nombre Comercial", "Propietario", "Dirección", "Teléfono"];

describe("parseWorkbook", () => {
  it("turns each sheet into a group and maps the columns", () => {
    const data = buildWorkbook({
      "Grupo 1": [HEADER, ["1800000000001", "Tienda", "Víveres Ana", "Ana Pérez", "Calle 1", "0990000000"]],
      "Grupo 2": [HEADER, [1800000000002, "Heladería", "Frío", "Luis Mora", "Calle 2", ""]],
    });

    const sheets = parseWorkbook(data);

    expect(sheets.map((s) => s.name)).toEqual(["Grupo 1", "Grupo 2"]);
    expect(sheets[0]?.rows[0]?.premise).toMatchObject({ ruc: "1800000000001", trade_name: "Víveres Ana" });
    expect(sheets[1]?.rows[0]?.premise.ruc).toBe("1800000000002");
    expect(sheets[1]?.rows[0]?.level).toBe("ok");
  });

  it("finds the header below a title row and skips empty rows", () => {
    const data = buildWorkbook({
      Hoja: [["Listado de locales"], [], HEADER, ["1800000000001", "", "", "", "Calle 1", ""], ["", "", "", "", "", ""]],
    });

    const [sheet] = parseWorkbook(data);

    expect(sheet?.rows).toHaveLength(1);
    expect(sheet?.rows[0]?.rowNumber).toBe(4);
  });

  it("flags damaged RUCs, missing addresses and duplicates", () => {
    const data = buildWorkbook({
      Hoja: [
        HEADER,
        ["1,8025E+12", "", "Local A", "", "Calle 1", ""],
        ["1800000000001", "", "Local B", "", "", ""],
        ["1800000000001", "", "Local B", "", "", ""],
      ],
    });

    const rows = parseWorkbook(data)[0]?.rows ?? [];

    expect(rows.map((r) => r.level)).toEqual(["error", "warning", "error"]);
  });

  it("reports a sheet without a RUC column", () => {
    const data = buildWorkbook({ Notas: [["Comentario"], ["nada"]] });
    expect(parseWorkbook(data)[0]?.missingColumns).toEqual(["ruc"]);
  });
});
