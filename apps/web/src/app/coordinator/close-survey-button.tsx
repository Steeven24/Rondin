"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { closeSurvey } from "./actions";

/** Two-step button: closing a survey makes it read-only, so ask before doing it. */
export function CloseSurveyButton({ surveyId, name }: { surveyId: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    const ok = window.confirm(
      `¿Cerrar «${name}»?\n\nPasará al historial en solo lectura: ya no se podrán registrar visitas. ` +
        "Podrás descargar sus informes y subir el siguiente Excel.",
    );
    if (!ok) return;
    startTransition(async () => {
      const result = await closeSurvey(surveyId);
      if (result.error) return setError(result.error);
      router.push("/coordinator/history");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex h-11 items-center rounded-xl border border-[#e8b4a0] bg-white px-4 text-sm font-semibold text-bad hover:bg-bad-soft disabled:opacity-60"
      >
        {pending ? "Cerrando…" : "Cerrar relevamiento"}
      </button>
      {error && <span className="self-center text-sm text-bad">{error}</span>}
    </>
  );
}
