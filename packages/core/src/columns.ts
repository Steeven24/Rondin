/** Premise fields that can be read from the Excel file. */
export const PREMISE_FIELDS = [
  "ruc",
  "trade_name",
  "owner_name",
  "activity",
  "address",
  "phone",
  "sector",
  "value",
] as const;
export type PremiseField = (typeof PREMISE_FIELDS)[number];

export const REQUIRED_FIELDS: readonly PremiseField[] = ["ruc"];

/** Header names found in the source Excel files (normalized: lowercase, no accents). */
const HEADER_ALIASES: Record<PremiseField, string[]> = {
  ruc: ["ruc", "numero ruc", "n ruc", "nro ruc"],
  trade_name: ["nombre comercial", "nombre del local", "local", "establecimiento", "nombre fantasia"],
  owner_name: ["representante legal", "propietario", "razon social", "nombre propietario", "contribuyente"],
  activity: ["tipo establecimiento", "tipo de establecimiento", "actividad", "actividad economica", "giro"],
  address: ["direccion", "ubicacion", "domicilio"],
  phone: ["telefono", "celular", "telefonos", "contacto"],
  sector: ["sector", "barrio", "parroquia", "zona"],
  value: ["valor"],
};

export function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Maps each known field to its column index. Fields not found are left out. */
export function detectColumns(headerRow: unknown[]): Partial<Record<PremiseField, number>> {
  const result: Partial<Record<PremiseField, number>> = {};
  headerRow.forEach((cell, index) => {
    const header = normalizeHeader(cell);
    for (const field of PREMISE_FIELDS) {
      if (result[field] === undefined && HEADER_ALIASES[field].includes(header)) {
        result[field] = index;
      }
    }
  });
  return result;
}
