import { VISIT_STATUS_LABELS, VISIT_STATUSES } from "@rondin/core";
import { Text, View } from "@react-pdf/renderer";
import type { PdfReportData } from "./report-data";
import { COLORS, STATUS_COLORS, styles } from "./styles";

export const dateFormat = new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeZone: "America/Guayaquil" });

/** Simple table: column widths in %, one array of texts per row. */
export function Table({ head, widths, rows }: { head: string[]; widths: number[]; rows: string[][] }) {
  return (
    <View style={styles.table}>
      <View style={styles.headRow} fixed>
        {head.map((h, i) => (
          <Text key={h} style={[styles.headCell, { width: `${widths[i]}%` }]}>{h}</Text>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={r % 2 ? [styles.row, styles.rowAlt] : styles.row} wrap={false}>
          {row.map((value, i) => (
            <Text key={i} style={[styles.cell, { width: `${widths[i]}%` }]}>{value}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export function GeneralData({ data }: { data: PdfReportData }) {
  const items: [string, string][] = [
    ["Institución o programa", data.survey.institution ?? "—"],
    ["Relevamiento", data.survey.name],
    ["Período", data.survey.period ?? "—"],
    ["Grupo", data.group.name],
    ["Líder del grupo", data.leader ? `${data.leader.name}${data.leader.nationalId ? ` · C.I. ${data.leader.nationalId}` : ""}` : "—"],
    ["Fecha de inicio", dateFormat.format(new Date(data.survey.startedAt))],
    ["Fecha de cierre", data.survey.closedAt ? dateFormat.format(new Date(data.survey.closedAt)) : "En curso"],
    ["Fecha de emisión", dateFormat.format(data.issuedAt)],
  ];
  return (
    <View style={styles.table}>
      {items.map(([k, v], i) => (
        <View key={k} style={i === 0 ? { flexDirection: "row" } : styles.kvRow}>
          <Text style={styles.kvKey}>{k}</Text>
          <Text style={styles.kvValue}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export function Members({ data }: { data: PdfReportData }) {
  if (data.members.length === 0) return <Text style={styles.muted}>El grupo no tiene miembros registrados.</Text>;
  return (
    <Table
      head={["N.º", "Nombre", "Cédula", "Locales asignados", "Locales visitados"]}
      widths={[7, 43, 18, 16, 16]}
      rows={data.members.map((m, i) => [String(i + 1), m.name, m.nationalId ?? "—", String(m.assigned), String(m.visited)])}
    />
  );
}

/** Totals by status with percentage and a horizontal bar chart. */
export function ResultsSummary({ data }: { data: PdfReportData }) {
  const total = data.premises.length;
  const lines = [
    ...VISIT_STATUSES.map((s) => ({ label: VISIT_STATUS_LABELS[s], n: data.premises.filter((p) => p.status === s).length, color: STATUS_COLORS[s] })),
    { label: "Pendiente de visita", n: data.premises.filter((p) => !p.status).length, color: STATUS_COLORS.pending },
  ];
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  return (
    <View>
      {lines.map((l) => (
        <View key={l.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }} wrap={false}>
          <Text style={{ width: "30%", fontSize: 8 }}>{l.label}</Text>
          <View style={{ width: "50%", height: 9, backgroundColor: COLORS.soft }}>
            <View style={{ width: `${pct(l.n)}%`, height: 9, backgroundColor: l.color }} />
          </View>
          <Text style={{ width: "20%", fontSize: 8, textAlign: "right" }}>{l.n} ({pct(l.n)} %)</Text>
        </View>
      ))}
      <Text style={[styles.bold, { marginTop: 4, fontSize: 8 }]}>Total de locales: {total}</Text>
    </View>
  );
}
