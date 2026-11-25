import { observationText, VISIT_STATUS_LABELS } from "@rondin/core";
import { Image, Text, View } from "@react-pdf/renderer";
import type { PdfReportData } from "./report-data";
import { COLORS, styles } from "./styles";
import { dateFormat, Table } from "./sections-summary";

const dateTime = new Intl.DateTimeFormat("es-EC", { dateStyle: "short", timeStyle: "short", timeZone: "America/Guayaquil" });

export function PremisesDetail({ data }: { data: PdfReportData }) {
  return (
    <Table
      head={["N.º", "RUC", "Local / representante", "Dirección", "Estado", "N.º func.", "Visitado por / fecha"]}
      widths={[5, 13, 22, 20, 13, 10, 17]}
      rows={data.premises.map((p, i) => [
        String(i + 1),
        p.ruc,
        `${p.tradeName ?? "Sin nombre comercial"}\n${p.ownerName ?? ""}`,
        p.address ?? "—",
        p.status ? VISIT_STATUS_LABELS[p.status] : "Pendiente",
        p.registrationNumber ?? "—",
        p.visitedBy ? `${p.visitedBy}\n${p.visitedAt ? dateFormat.format(new Date(p.visitedAt)) : ""}` : "—",
      ])}
    />
  );
}

/** Premises that don't exist, are closed or couldn't be visited, with their observation. */
export function Novelties({ data }: { data: PdfReportData }) {
  const rows = data.premises.filter((p) => p.status === "not_found" || p.status === "temporarily_closed" || p.status === "not_visited");
  if (rows.length === 0) return <Text style={styles.muted}>No se registraron novedades.</Text>;
  return (
    <Table
      head={["Local", "RUC", "Observación"]}
      widths={[32, 18, 50]}
      rows={rows.map((p) => [p.tradeName ?? "Sin nombre comercial", p.ruc, observationText(p)])}
    />
  );
}

/** Photos grouped by premise, two per row, each with date, time and coordinates. */
export function PhotoAnnex({ data }: { data: PdfReportData }) {
  const withPhotos = data.premises.filter((p) => p.photos.length > 0);
  if (withPhotos.length === 0) return <Text style={styles.muted}>No se registraron fotos de respaldo.</Text>;
  return (
    <View>
      {withPhotos.map((p) => (
        <View key={p.ruc + (p.tradeName ?? "")} style={{ marginBottom: 12 }} wrap={false}>
          <Text style={[styles.bold, { fontSize: 9, marginBottom: 4 }]}>
            {p.tradeName ?? "Sin nombre comercial"} <Text style={styles.muted}>· RUC {p.ruc}</Text>
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {p.photos.map((photo, i) => (
              <View key={i} style={{ width: "48%" }}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt; the caption below describes it */}
                <Image src={photo.data} style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 4 }} />
                <Text style={{ fontSize: 7, color: COLORS.muted, marginTop: 2 }}>
                  {dateTime.format(new Date(photo.takenAt))}
                  {photo.latitude !== null && photo.longitude !== null ? ` · GPS ${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}` : ""}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function SignatureBlock({ role, name, nationalId }: { role: string; name?: string; nationalId?: string | null }) {
  return (
    <View style={{ width: "42%", alignItems: "center" }}>
      <View style={{ width: "100%", borderTopWidth: 0.8, borderTopColor: COLORS.ink, marginTop: 48, marginBottom: 4 }} />
      <Text style={styles.bold}>{name ?? " "}</Text>
      <Text style={styles.muted}>{role}</Text>
      <Text style={styles.muted}>C.I. {nationalId ?? "______________"}</Text>
    </View>
  );
}

export function Signatures({ data }: { data: PdfReportData }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }} wrap={false}>
      <SignatureBlock role="Líder del grupo" name={data.leader?.name} nationalId={data.leader?.nationalId} />
      <SignatureBlock role="Coordinador/a o tutor/a" name={data.coordinator?.name} nationalId={data.coordinator?.nationalId} />
    </View>
  );
}
