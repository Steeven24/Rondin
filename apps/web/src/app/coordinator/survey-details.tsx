"use client";

import { useState, useTransition } from "react";
import { Alert, Field } from "@/components/ui";
import { updateSurveyDetails } from "./actions";

interface SurveyDetailsProps {
  surveyId: string;
  name: string;
  institution: string | null;
  period: string | null;
}

/**
 * Survey name, program and period, editable by the coordinator.
 * The program (e.g. "Programa Jóvenes en Acción") heads every page of the PDF reports.
 */
export function SurveyDetails({ surveyId, name, institution, period }: SurveyDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
        <span>{[name, institution, period].filter(Boolean).join(" · ")}</span>
        <button type="button" onClick={() => setEditing(true)} className="font-semibold text-brand">
          Editar datos
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setError("");
        startTransition(async () => {
          const result = await updateSurveyDetails({
            surveyId,
            name: String(form.get("name") ?? ""),
            institution: String(form.get("institution") ?? ""),
            period: String(form.get("period") ?? ""),
          });
          if (result.error) return setError(result.error);
          setEditing(false);
        });
      }}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Nombre" name="name" defaultValue={name} required minLength={3} />
        <Field label="Institución o programa" name="institution" defaultValue={institution ?? ""} placeholder="Ej.: Programa Jóvenes en Acción" hint="Aparece en el encabezado de los informes PDF." />
        <Field label="Período" name="period" defaultValue={period ?? ""} placeholder="Ej.: Noviembre 2026" />
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2.5">
        <button type="submit" disabled={pending} className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  );
}
