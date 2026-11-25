"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";
import { Alert, Field, SubmitButton } from "@/components/ui";
import { createLeader } from "./actions";

export function LeaderForm({ groupId }: { groupId: string }) {
  const [state, action] = useActionState<FormState, FormData>(createLeader, {});

  if (state.message) return <Alert kind="ok">{state.message}</Alert>;

  return (
    <details className="rounded-xl border border-line-strong">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-brand">Asignar líder</summary>
      <form action={action} className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
        <input type="hidden" name="group_id" value={groupId} />
        <Field label="Nombre completo" name="full_name" required />
        <Field label="Cédula" name="national_id" inputMode="numeric" maxLength={10} required />
        <Field label="Correo" name="email" type="email" required />
        <Field label="Contraseña temporal" name="password" type="text" autoComplete="off" required hint="Letras y números, mínimo 8." />
        {state.error && (
          <div className="sm:col-span-2">
            <Alert>{state.error}</Alert>
          </div>
        )}
        <div className="sm:col-span-2">
          <SubmitButton pendingText="Creando…">Crear cuenta de líder</SubmitButton>
        </div>
      </form>
    </details>
  );
}
