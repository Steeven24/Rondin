"use client";

import type { ReviewStatus } from "@rondin/core";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui";
import { reviewVisit } from "./actions";

interface ReviewPanelProps {
  visitId: string;
  status: ReviewStatus;
}

/** Leader's review: approve the visit, or return it to the member saying what to fix. */
export function ReviewPanel({ visitId, status }: ReviewPanelProps) {
  const [returning, setReturning] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function send(decision: "approved" | "returned") {
    setError("");
    startTransition(async () => {
      const result =
        decision === "approved"
          ? await reviewVisit({ visitId, decision })
          : await reviewVisit({ visitId, decision, comment });
      if (result.error) return setError(result.error);
      setReturning(false);
      setComment("");
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-brand-soft bg-white p-5">
      <h2 className="text-lg font-semibold">Revisión</h2>
      <p className="text-sm text-muted">
        {status === "approved"
          ? "Ya aprobaste esta visita. Puedes devolverla si encuentras un error."
          : status === "returned"
            ? "La devolviste al miembro. Cuando la corrija volverá a «Por revisar»."
            : "Revisa el resultado y las fotos. Solo las visitas aprobadas quedan listas para el informe."}
      </p>

      {returning ? (
        <div className="flex flex-col gap-2.5">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            ¿Qué debe corregir?
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              autoFocus
              placeholder="Ej.: la foto no muestra la fachada; toma otra desde la calle."
              className="rounded-xl border border-line-strong bg-white p-3 text-[15px] font-normal"
            />
          </label>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" disabled={pending} onClick={() => send("returned")} className="h-11 rounded-xl bg-[#b4361a] px-4 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Enviando…" : "Devolver al miembro"}
            </button>
            <button type="button" disabled={pending} onClick={() => setReturning(false)} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {status !== "approved" && (
            <button type="button" disabled={pending} onClick={() => send("approved")} className="h-11 rounded-xl bg-[#2f9e5d] px-5 text-sm font-semibold text-white hover:bg-ok disabled:opacity-60">
              {pending ? "Guardando…" : "Aprobar visita"}
            </button>
          )}
          {status !== "returned" && (
            <button type="button" disabled={pending} onClick={() => setReturning(true)} className="h-11 rounded-xl border border-[#e8b4a0] px-4 text-sm font-semibold text-bad hover:bg-bad-soft">
              Devolver para corregir
            </button>
          )}
        </div>
      )}
      {error && <Alert>{error}</Alert>}
    </section>
  );
}
