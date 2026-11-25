import { Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";

interface FrameProps {
  program: string;
  surveyName: string;
  reportNumber: string;
  issuedOn: string;
}

/**
 * Header band and footer repeated on every page (`fixed`), so each sheet shows
 * which program the report belongs to, even when printed or split.
 */
export function PageFrame({ program, surveyName, reportNumber, issuedOn }: FrameProps) {
  return (
    <>
      <View style={styles.band} fixed>
        <View>
          <Text style={styles.bandProgram}>{program}</Text>
          <Text style={styles.bandSub}>{surveyName}</Text>
        </View>
        <View>
          <Text style={styles.bandRight}>Informe N.º {reportNumber}</Text>
          <Text style={styles.bandRight}>Emitido el {issuedOn}</Text>
        </View>
      </View>
      <View style={styles.bandAccent} fixed />
      <View style={styles.footer} fixed>
        <Text>{program} · Informe de relevamiento de locales comerciales</Text>
        <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </View>
    </>
  );
}
