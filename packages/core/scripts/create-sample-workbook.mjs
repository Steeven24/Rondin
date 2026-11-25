// Creates fixtures/sample-survey.xlsx with FAKE data for demos and manual tests.
// Usage: node packages/core/scripts/create-sample-workbook.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { utils, write } from "xlsx";

const HEADER = ["RUC", "Actividad", "Nombre Comercial", "Propietario", "Dirección", "Teléfono", "Sector"];
const ACTIVITIES = ["Tienda / abarrotes", "Restaurante", "Heladería", "Cafe-net", "Panadería", "Ferretería"];
const SECTORS = ["Centro", "La Merced", "Los Pinos", "Huachi", "Ficoa"];
const NAMES = ["Ana", "Luis", "María", "Carlos", "Rosa", "Jorge", "Elena", "Pedro"];
const SURNAMES = ["Pérez", "Gómez", "López", "Torres", "Vega", "Mora", "Ruiz", "Silva"];

const workbook = utils.book_new();
for (let group = 1; group <= 3; group++) {
  const rows = [HEADER];
  for (let i = 0; i < 8; i++) {
    const n = group * 100 + i;
    const ruc = `18${String(10000000 + n * 7919).slice(0, 8)}001`;
    rows.push([
      ruc,
      ACTIVITIES[n % ACTIVITIES.length],
      `Local Demo ${n}`,
      `${SURNAMES[(n + 3) % 8]} ${SURNAMES[n % 8]} ${NAMES[n % 8]}`,
      `Calle Ficticia ${n} y Av. Ejemplo`,
      `09${String(90000000 + n).slice(0, 8)}`,
      SECTORS[i % SECTORS.length],
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
