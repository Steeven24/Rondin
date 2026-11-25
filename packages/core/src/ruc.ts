export type RucIssue = "scientific_notation" | "leading_zero_restored" | "invalid_length" | "empty";

export interface RucResult {
  /** Normalized RUC (13 digits) or null when it can't be recovered. */
  value: string | null;
  issue?: RucIssue;
}

/**
 * Normalizes a RUC read from Excel.
 * - Numeric cells keep all digits, so they are converted back to text.
 * - Text like "1,8025E+12" means Excel already lost digits: it can't be recovered.
 * - 12 digits usually means Excel dropped the leading zero (provinces 01-09).
 */
export function normalizeRuc(raw: unknown): RucResult {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { value: null, issue: "empty" };
  }

  if (typeof raw === "number") {
    return normalizeDigits(Math.round(raw).toString());
  }

  const text = String(raw).trim();
  if (/e\+?\d+$/i.test(text)) {
    return { value: null, issue: "scientific_notation" };
  }

  return normalizeDigits(text.replace(/[\s.-]/g, ""));
}

function normalizeDigits(digits: string): RucResult {
  if (/^\d{13}$/.test(digits)) return { value: digits };
  if (/^\d{12}$/.test(digits)) return { value: `0${digits}`, issue: "leading_zero_restored" };
  return { value: null, issue: "invalid_length" };
}

export const RUC_ISSUE_MESSAGES: Record<RucIssue, string> = {
  scientific_notation:
    "RUC dañado por Excel (notación científica). Corrígelo o pon la columna en formato Texto y vuelve a subir.",
  leading_zero_restored: "Se restauró el cero inicial que Excel había quitado.",
  invalid_length: "El RUC debe tener 13 dígitos.",
  empty: "Falta el RUC.",
};
