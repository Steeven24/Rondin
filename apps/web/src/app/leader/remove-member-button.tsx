"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeMember } from "./actions";

export function RemoveMemberButton({ memberId, name }: { memberId: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    if (!window.confirm(`¿Quitar a ${name} del equipo? Sus locales pendientes quedarán sin asignar.`)) return;
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.error) return setError(result.error);
      router.push("/leader");
    });
  }

  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="h-10 rounded-xl border border-[#e8b4a0] px-3.5 text-sm font-semibold text-bad hover:bg-bad-soft disabled:opacity-60"
      >
        {pending ? "Quitando…" : `Quitar a ${name} del equipo`}
      </button>
      {error && <span className="text-sm text-bad">{error}</span>}
    </span>
  );
}
