"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { type FormState, login } from "@/app/(auth)/actions";
import { joinWithCode } from "@/app/(auth)/join/actions";
import { Alert, Field, SubmitButton } from "@/components/ui";

type Tab = "login" | "code";

export function LoginForms() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <>
      <div className="flex rounded-xl bg-[#e9eaf5] p-[3px]" role="tablist">
        {(
          [
            ["login", "Con mi cuenta"],
            ["code", "Tengo un código"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`h-10 flex-1 rounded-[10px] text-sm ${tab === id ? "bg-white font-semibold shadow-sm" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "login" ? <LoginForm /> : <JoinForm />}
    </>
  );
}

function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required />
      <Link href="/forgot-password" className="self-end text-[13px] text-brand no-underline">
        ¿Olvidaste tu contraseña?
      </Link>
      {state.error && <Alert>{state.error}</Alert>}
      <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
    </form>
  );
}

function JoinForm() {
  const [state, action] = useActionState<FormState, FormData>(joinWithCode, {});
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <Field label="Código de invitación" name="code" required maxLength={8} autoCapitalize="characters" className="font-mono tracking-widest" hint="Tu líder te comparte el código." />
      <Field label="Nombre completo" name="full_name" autoComplete="name" required />
      <Field label="Cédula" name="national_id" inputMode="numeric" maxLength={10} required />
      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field label="Contraseña" name="password" type="password" autoComplete="new-password" required hint="Mínimo 8 caracteres, con letras y números." />
      <label className="flex items-start gap-2.5 text-[13px] text-muted">
        <input type="checkbox" name="privacy" required className="mt-0.5 h-4 w-4 accent-brand" />
        <span>
          Acepto el <Link href="/privacy" target="_blank" className="text-brand">aviso de privacidad</Link> y el tratamiento de mis datos para este relevamiento.
        </span>
      </label>
      {state.error && <Alert>{state.error}</Alert>}
      <SubmitButton pendingText="Creando cuenta…">Unirme a mi grupo</SubmitButton>
    </form>
  );
}
