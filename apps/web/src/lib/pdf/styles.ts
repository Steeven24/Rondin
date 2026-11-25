import { Font, StyleSheet } from "@react-pdf/renderer";

// Never split words with hyphens (addresses and names read badly when cut).
Font.registerHyphenationCallback((word) => [word]);

/** Brand colors (same as the app) used in the institutional report. */
export const COLORS = {
  brand: "#30329b",
  brandDeep: "#1f1f71",
  accent: "#ffc600",
  ink: "#1b1c45",
  muted: "#5b5d7e",
  line: "#d6d7ea",
  soft: "#eeeff8",
};

export const STATUS_COLORS = {
  operating_with_permit: "#2f9e5d",
  operating_without_permit: "#30329b",
  temporarily_closed: "#e0b02b",
  not_found: "#d9603b",
  not_visited: "#8b8da8",
  pending: "#cbcce0",
} as const;

export const styles = StyleSheet.create({
  page: { paddingTop: 92, paddingBottom: 56, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9, color: COLORS.ink, lineHeight: 1.35 },
  // Program band repeated at the top of every page.
  band: { position: "absolute", top: 0, left: 0, right: 0, height: 64, backgroundColor: COLORS.brand, paddingHorizontal: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bandAccent: { position: "absolute", top: 64, left: 0, right: 0, height: 4, backgroundColor: COLORS.accent },
  bandProgram: { color: "#ffffff", fontSize: 13, fontFamily: "Helvetica-Bold" },
  bandSub: { color: "#dcdcf3", fontSize: 8, marginTop: 2 },
  bandRight: { color: "#dcdcf3", fontSize: 8, textAlign: "right" },
  footer: { position: "absolute", top: 806, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: COLORS.muted, borderTopWidth: 0.5, borderTopColor: COLORS.line, paddingTop: 6 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", color: COLORS.brandDeep, textAlign: "center", lineHeight: 1.2, marginBottom: 6 },
  subtitle: { fontSize: 9, color: COLORS.muted, textAlign: "center", marginBottom: 14 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.brand, marginTop: 14, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: COLORS.accent },
  paragraph: { marginBottom: 4, textAlign: "justify" },
  muted: { color: COLORS.muted },
  bold: { fontFamily: "Helvetica-Bold" },
  // Tables
  table: { borderWidth: 0.5, borderColor: COLORS.line },
  headRow: { flexDirection: "row", backgroundColor: COLORS.brand },
  headCell: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 7.5, padding: 4 },
  row: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: COLORS.line },
  rowAlt: { backgroundColor: "#f7f7fc" },
  cell: { fontSize: 7.5, padding: 4 },
  // Key/value grid for "Datos generales"
  kvRow: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: COLORS.line },
  kvKey: { width: "32%", padding: 4, backgroundColor: COLORS.soft, fontFamily: "Helvetica-Bold", fontSize: 8 },
  kvValue: { width: "68%", padding: 4, fontSize: 8 },
});
