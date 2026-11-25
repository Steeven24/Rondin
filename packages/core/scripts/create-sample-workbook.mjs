// Creates fixtures/sample-survey.xlsx with FAKE data in the same format as the real source file.
// Usage: node packages/core/scripts/create-sample-workbook.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { utils, write } from "xlsx";

const HEADER = ["RUC", "TIPO_ESTABLECIMIENTO", "NOMBRE_COMERCIAL", "REPRESENTANTE_LEGAL", "DIRECCION", "TELEFONO", "VALOR"];
const TYPES = ["Tienda / abarrotes", "Restaurante", "Heladería", "Cafe-net", "Panadería", "Ferretería"];
const NAMES = ["Ana", "Luis", "María", "Carlos", "Rosa", "Jorge", "Elena", "Pedro"];
const SURNAMES = ["Pérez", "Gómez", "López", "Torres", "Vega", "Mora", "Ruiz", "Silva"];
const GROUPS = 11;
const PER_GROUP = 14;

const workbook = utils.book_new();
for (let group = 1; group <= GROUPS; group++) {
  const rows = [HEADER];
  for (let i = 0; i < PER_GROUP; i++) {
    const n = group * 100 + i;
    rows.push([
      `18${String(10000000 + n * 7919).slice(0, 8)}001`,
      TYPES[n % TYPES.length],
      `Local Demo ${n}`,
      `${SURNAMES[(n + 3) % 8]} ${SURNAMES[n % 8]} ${NAMES[n % 8]}`,
      `Calle Ficticia ${n} y Av. Ejemplo`,
      `09${String(90000000 + n).slice(0, 8)}`,
      [25, 40, 60, 80][n % 4],
    ]);
  }
  // Typical Excel damage, to show the validations.
  if (group === 1) rows[3][0] = "1,8025E+12";
  if (group === 2) rows[2][0] = "190012345001";
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), `Grupo ${group}`);
}

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "fixtures", "sample-survey.xlsx");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, write(workbook, { type: "buffer", bookType: "xlsx" }));
console.log(`Sample workbook written to ${out}`);
