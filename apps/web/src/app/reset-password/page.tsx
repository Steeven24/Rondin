"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";
import { Alert, Field, SubmitButton } from "@/components/ui";
import { updatePassword } from "./actions";

export default function ResetPasswordPage() {
  const [state, action] = useActionState<FormState, FormData>(updatePassword, {});
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Nueva contraseña</h1>
      <form action={action} className="flex flex-col gap-3.5">
        <Field label="Nueva contraseña" name="password" type="password" autoComplete="new-password" required hint="Mínimo 8 caracteres, con letras y números." />
        {state.error && <Alert>{state.error}</Alert>}
        <SubmitButton>Guardar contraseña</SubmitButton>
      </form>
    </main>
  );
}
