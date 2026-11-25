"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type FormState, requestPasswordReset } from "@/app/(auth)/actions";
import { Alert, Field, SubmitButton } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold">Recuperar contraseña</h2>
        <p className="text-sm text-muted">Te enviaremos un enlace a tu correo.</p>
      </div>
      <form action={action} className="flex flex-col gap-3.5">
        <Field label="Correo" name="email" type="email" autoComplete="email" required />
        {state.error && <Alert>{state.error}</Alert>}
        {state.message && <Alert kind="ok">{state.message}</Alert>}
        <SubmitButton>Enviar enlace</SubmitButton>
      </form>
      <Link href="/login" className="text-sm text-brand">← Volver a iniciar sesión</Link>
    </>
  );
}
