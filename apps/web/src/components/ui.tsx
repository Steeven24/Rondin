"use client";

import { useFormStatus } from "react-dom";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };

/** Labeled input with the app's field style. */
export function Field({ label, hint, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      <input
        className={`h-12 rounded-xl border border-line-strong bg-white px-3.5 text-[15px] font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

/** Primary submit button that shows a pending state while the form is sent. */
export function SubmitButton({ children, pendingText = "Enviando…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 items-center justify-center rounded-2xl bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "info" | "ok"; children: React.ReactNode }) {
  const styles = {
    error: "bg-bad-soft text-bad",
    info: "bg-brand-soft text-brand-dark",
    ok: "bg-ok-soft text-ok",
  };
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-xl px-3.5 py-3 text-sm ${styles[kind]}`}>
      {children}
    </p>
  );
}
