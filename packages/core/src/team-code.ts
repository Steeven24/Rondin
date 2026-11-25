/**
 * Reads the team code from a sheet name: "(G9) LA MATRIZ" -> "G9", "(G2)CELIANO MONGE" -> "G2".
 * Only the code in parentheses counts, so "Grupo 9" or "G9 sin paréntesis" return null.
 */
export function extractTeamCode(sheetName: string): string | null {
  const match = /\(\s*G\s*(\d{1,3})\s*\)/i.exec(sheetName);
  return match ? `G${Number(match[1])}` : null;
}
