import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PageFrame } from "./page-frame";
import type { PdfReportData } from "./report-data";
import { Novelties, PhotoAnnex, PremisesDetail, Signatures } from "./sections-detail";
import { dateFormat, GeneralData, Members, ResultsSummary } from "./sections-summary";
import { COLORS, styles } from "./styles";

/** Institutional group report, following the structure of state programs such as Jóvenes en Acción. */
export function GroupReport({ data }: { data: PdfReportData }) {
  // The program name comes from the survey ("Institución o programa"), so the same template serves any program.
  const program = data.survey.institution ?? "Relevamiento de locales comerciales";
  const visited = data.premises.filter((p) => p.status).length;
  const withPermit = data.premises.filter((p) => p.status === "operating_with_permit").length;
  const frame = (
    <PageFrame program={program} surveyName={data.survey.name} reportNumber={data.reportNumber} issuedOn={dateFormat.format(data.issuedAt)} />
  );

  return (
    <Document title={`Informe ${data.group.name}`} author={program} subject="Informe de relevamiento de locales comerciales" language="es">
      <Page size="A4" style={styles.page}>
        {frame}
        <Text style={styles.title}>INFORME DE RELEVAMIENTO DE LOCALES COMERCIALES</Text>
        <Text style={styles.subtitle}>{data.group.name}</Text>

        <Text style={styles.h2}>1. Datos generales</Text>
        <GeneralData data={data} />

        <Text style={styles.h2}>2. Integrantes</Text>
        <Members data={data} />

        <Text style={styles.h2}>3. Objetivo de la actividad</Text>
        <Text style={styles.paragraph}>
          Verificar el funcionamiento de los locales comerciales asignados al grupo y el estado de su permiso anual de
          funcionamiento, dejando constancia de cada visita con su resultado y evidencia fotográfica.
        </Text>

        <Text style={styles.h2}>4. Metodología</Text>
        <Text style={styles.paragraph}>
          Visita presencial a cada local, verificación de su funcionamiento y del número de registro anual, y registro
          fotográfico tomado desde la aplicación Rondín con fecha, hora y ubicación GPS. Cada visita fue revisada por el
          líder del grupo.
        </Text>

        <Text style={styles.h2}>5. Resumen de resultados</Text>
        <ResultsSummary data={data} />
      </Page>

      <Page size="A4" style={styles.page}>
        {frame}
        <Text style={styles.h2}>6. Detalle de locales</Text>
        <PremisesDetail data={data} />

        <Text style={styles.h2}>7. Novedades</Text>
        <Novelties data={data} />

        <Text style={styles.h2}>8. Conclusiones y recomendaciones</Text>
        <Text style={styles.paragraph}>
          Se visitaron {visited} de {data.premises.length} locales asignados al grupo; {withPermit} funcionan con permiso
          anual de funcionamiento registrado.
        </Text>
        <View>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ borderBottomWidth: 0.5, borderBottomColor: COLORS.line, height: 18 }} />
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {frame}
        <Text style={styles.h2}>9. Anexo fotográfico</Text>
        <PhotoAnnex data={data} />

        <Text style={styles.h2}>10. Firmas</Text>
        <Signatures data={data} />
      </Page>
    </Document>
  );
}
