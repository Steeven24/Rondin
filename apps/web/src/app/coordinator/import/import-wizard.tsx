"use client";

import { extractTeamCode, normalizeRuc, type ParsedSheet, parseWorkbook, RUC_ISSUE_MESSAGES } from "@rondin/core";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, Field } from "@/components/ui";
import { importSurvey } from "./actions";
import { SheetPreview } from "./sheet-preview";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface KnownTeam {
  code: string;
  leaderName: string | null;
}

/** What happens to the team of a sheet: reused (with its leader), new, or no code at all. */
function teamStatus(sheetName: string, knownTeams: KnownTeam[]) {
  const code = extractTeamCode(sheetName);
  if (!code) return { code, label: "Sin código (G#): equipo nuevo", tone: "text-warn" };
  const known = knownTeams.find((t) => t.code === code);
  if (!known) return { code, label: `${code} · equipo nuevo`, tone: "text-muted" };
  return { code, label: `${code} · se mantiene${known.leaderName ? ` con ${known.leaderName}` : " (sin líder)"}`, tone: "text-ok" };
}

export function ImportWizard({ knownTeams }: { knownTeams: KnownTeam[] }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [surveyForm, setSurveyForm] = useState<FormData | null>(null);

  // The file is read in the browser: personal data only leaves the device after confirming.
  async function handleFile(file: File | undefined) {
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setError("El archivo supera 5 MB.");
    try {
      const parsed = parseWorkbook(await file.arrayBuffer());
      setSheets(parsed);
      setFileName(file.name);
      // Open the first group sheet, not the reference one.
      setSelected(Math.max(0, parsed.findIndex((s) => !s.isReference)));
    } catch {
      setError("No se pudo leer el archivo. Asegúrate de que sea un Excel (.xlsx).");
    }
  }

  function fixRuc(sheetIndex: number, rowNumber: number, value: string) {
    const result = normalizeRuc(value);
    if (!result.value) return;
    setSheets((current) =>
      current.map((sheet, i) =>
        i !== sheetIndex
          ? sheet
          : {
              ...sheet,
              rows: sheet.rows.map((row) =>
                row.rowNumber !== rowNumber
                  ? row
                  : { ...row, premise: { ...row.premise, ruc: result.value }, level: "ok", messages: [] },
              ),
            },
      ),
    );
  }

  const usable = sheets.filter((s) => !s.isReference && s.missingColumns.length === 0);
  const validRows = (sheet: ParsedSheet) => sheet.rows.filter((r) => r.level !== "error" && r.premise.ruc);
  const totalValid = usable.reduce((sum, s) => sum + validRows(s).length, 0);
  const totalErrors = usable.reduce((sum, s) => sum + s.rows.length - validRows(s).length, 0);

  const groups = usable
    .map((sheet) => ({
      name: sheet.name.slice(0, 80),
      source_sheet: sheet.name.slice(0, 80),
      team_code: extractTeamCode(sheet.name),
      premises: validRows(sheet).map((r) => ({ ...r.premise, ruc: r.premise.ruc as string })),
    }))
    .filter((g) => g.premises.length > 0);
  const keptTeams = groups.filter((g) => g.team_code && knownTeams.some((t) => t.code === g.team_code)).length;
  const withoutCode = groups.filter((g) => !g.team_code).length;

  // The form only opens the confirmation; the import runs when the coordinator confirms.
  function askConfirmation(formData: FormData) {
    setError("");
    setSurveyForm(formData);
  }

  function runImport() {
    if (!surveyForm) return;
    startTransition(async () => {
      const result = await importSurvey({
        name: String(surveyForm.get("name") ?? ""),
        institution: String(surveyForm.get("institution") ?? ""),
        period: String(surveyForm.get("period") ?? ""),
        groups,
      });
      if (result.error) {
        setSurveyForm(null);
        return setError(result.error);
      }
      router.push("/coordinator/groups");
    });
  }

  const current = sheets[selected];

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
        <div className="flex min-w-52 flex-1 flex-col">
          <span className="font-semibold">{fileName || "Ningún archivo seleccionado"}</span>
          <span className="text-[13px] text-muted">
            {sheets.length > 0
              ? `${usable.length} hojas de grupo · ${totalValid} locales válidos · cada hoja se convierte en un grupo`
              : "Sube el Excel con una hoja por grupo."}
          </span>
        </div>
        <label className="flex h-11 cursor-pointer items-center rounded-xl border border-line-strong px-4 text-sm font-semibold hover:bg-canvas">
          {sheets.length > 0 ? "Cambiar archivo" : "Elegir archivo"}
          <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
      </section>

      {error && <Alert>{error}</Alert>}

      {current && (
        <div className="flex flex-wrap items-start gap-5">
          <nav aria-label="Hojas" className="flex min-w-0 flex-[1_1_240px] flex-col gap-1 rounded-2xl border border-line bg-white p-4">
            <h2 className="px-2 pb-2 text-[15px] font-semibold">Hojas → grupos</h2>
            {sheets.map((sheet, i) => {
              const issues = sheet.rows.filter((r) => r.level !== "ok").length;
              return (
                <button
                  key={sheet.name}
                  type="button"
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm ${selected === i ? "bg-brand-soft font-semibold" : ""}`}
                >
                  <span className="flex-1">{sheet.name}</span>
                  {sheet.isReference ? (
                    <span className="rounded-full bg-soft px-2 text-xs font-semibold text-muted">No se sube</span>
                  ) : (
                    <>
                      <span className="font-mono text-xs text-muted">{sheet.rows.length} filas</span>
                      <span className={`min-w-6 rounded-full px-2 text-center text-xs font-semibold ${issues ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok"}`}>
                        {issues || "✓"}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          <section className="flex min-w-0 flex-[999_1_640px] flex-col gap-3.5 rounded-2xl border border-line bg-white px-5 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">Vista previa · {current.name}</h2>
              {!current.isReference && (
                <span className={`text-[13px] font-semibold ${teamStatus(current.name, knownTeams).tone}`}>
                  Equipo: {teamStatus(current.name, knownTeams).label}
                </span>
              )}
            </div>
            {current.rows.some((r) => r.messages.includes(RUC_ISSUE_MESSAGES.scientific_notation)) && (
              <Alert kind="info">{RUC_ISSUE_MESSAGES.scientific_notation}</Alert>
            )}
            <SheetPreview key={current.name} sheet={current} onFixRuc={(row, value) => fixRuc(selected, row, value)} />
          </section>
        </div>
      )}

      {totalValid > 0 && (
        // onSubmit (not action) so React doesn't clear the fields if the coordinator cancels.
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askConfirmation(new FormData(e.currentTarget));
          }}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white px-5 py-5"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Datos del relevamiento</h2>
            <p className="text-[13px] text-muted">
              Identifican este trabajo en el panel y en el título de los informes. Solo el nombre es obligatorio.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nombre" name="name" required minLength={3} placeholder="Relevamiento de locales Ambato" />
            <Field label="Institución o programa" name="institution" placeholder="Ej.: GAD Municipal de Ambato" />
            <Field label="Período" name="period" placeholder="Ej.: Noviembre 2026" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-muted">
              {totalErrors > 0 ? `${totalErrors} filas con errores se omitirán. ` : ""}
              Después asignarás un líder a cada grupo.
            </span>
            <button type="submit" disabled={pending} className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:opacity-60">
              {`Revisar y crear ${groups.length} grupos`}
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!surveyForm}
        title="¿Crear el relevamiento?"
        confirmLabel={`Sí, crear ${groups.length} grupos`}
        pending={pending}
        onConfirm={runImport}
        onCancel={() => setSurveyForm(null)}
      >
        <p>
          Se creará <strong className="text-ink">«{String(surveyForm?.get("name") ?? "")}»</strong> con{" "}
          <strong className="text-ink">{groups.length} grupos</strong> y <strong className="text-ink">{totalValid} locales</strong>.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {keptTeams > 0 && <li>{keptTeams} equipos se mantienen con su líder y sus miembros.</li>}
          {groups.length - keptTeams > 0 && <li>{groups.length - keptTeams} equipos son nuevos y necesitarán un líder.</li>}
          {withoutCode > 0 && <li className="text-warn">{withoutCode} hojas no tienen código (G#): no se podrán reconocer en el siguiente relevamiento.</li>}
          {totalErrors > 0 && <li className="text-warn">{totalErrors} filas con errores se omitirán.</li>}
        </ul>
        <p>Revisa que sea el archivo correcto: el relevamiento quedará activo hasta que lo cierres.</p>
      </ConfirmDialog>
    </div>
  );
}
