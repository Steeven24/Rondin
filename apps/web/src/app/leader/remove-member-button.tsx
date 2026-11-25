"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { removeMember } from "./actions";

export function RemoveMemberButton({ memberId, name }: { memberId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function confirm() {
    startTransition(async () => {
      const result = await removeMember(memberId);
      if (result.error) return setError(result.error);
      setOpen(false);
      router.push("/leader");
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
        className="h-10 rounded-xl border border-[#e8b4a0] px-3.5 text-sm font-semibold text-bad hover:bg-bad-soft"
      >
        Quitar a {name} del equipo
      </button>
      <ConfirmDialog
        open={open}
        tone="danger"
        title={`¿Quitar a ${name} del equipo?`}
        confirmLabel="Sí, quitar del equipo"
        pending={pending}
        error={error}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      >
        <p>Sus locales <strong className="text-ink">pendientes quedarán sin asignar</strong> para que se los repartas a otro miembro. Las visitas que ya registró se conservan.</p>
        <p>Dejará de ver los locales del equipo.</p>
      </ConfirmDialog>
    </>
  );
}
