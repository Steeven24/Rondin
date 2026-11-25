"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { closeSurvey } from "./actions";

/** Closing a survey can't be undone, so it always goes through a confirmation dialog. */
export function CloseSurveyButton({ surveyId, name }: { surveyId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirm() {
    startTransition(async () => {
      const result = await closeSurvey(surveyId);
      if (result.error) return setError(result.error);
      setOpen(false);
      router.push("/coordinator/history");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="flex h-11 items-center rounded-xl border border-[#e8b4a0] bg-white px-4 text-sm font-semibold text-bad hover:bg-bad-soft"
      >
        Cerrar relevamiento
      </button>
      <ConfirmDialog
        open={open}
        tone="danger"
        title={`¿Cerrar «${name}»?`}
        confirmLabel="Sí, cerrar relevamiento"
        pending={pending}
        error={error}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      >
        <p>Pasará al historial en solo lectura y <strong className="text-ink">ya no se podrán registrar ni corregir visitas</strong>. Esta acción no se puede deshacer.</p>
        <p>Podrás descargar sus informes desde el historial y subir el siguiente Excel. Los equipos conservan su líder y sus miembros.</p>
      </ConfirmDialog>
    </>
  );
}
