"use client";

import { useEffect, useId, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" for actions that can't be undone. */
  tone?: "primary" | "danger";
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * App-styled confirmation modal (replaces window.confirm). Built on <dialog>, so the browser
 * handles focus, Esc to close and blocking the page behind it.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "primary",
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmStyle =
    tone === "danger" ? "bg-[#b4361a] hover:bg-[#962c14] text-white" : "bg-brand hover:bg-brand-dark text-white";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(e) => {
        // Click on the backdrop (outside the panel) closes it.
        if (e.target === ref.current && !pending) onCancel();
      }}
      className="m-auto w-[min(92vw,460px)] rounded-2xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-brand-deep/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === "danger" ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {tone === "danger" ? (
                <>
                  <path d="M12 3l9.5 17h-19z" />
                  <path d="M12 10v4M12 17h.01" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8h.01M11 12h1v4h1" />
                </>
              )}
            </svg>
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
            <div className="flex flex-col gap-2 text-sm text-muted">{children}</div>
          </div>
        </div>
        {error && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm text-bad">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            // On dangerous actions an accidental Enter should cancel, not confirm.
            autoFocus={tone === "danger"}
            className="h-11 rounded-xl border border-line-strong px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            autoFocus={tone !== "danger"}
            className={`h-11 rounded-xl px-4 text-sm font-semibold disabled:opacity-60 ${confirmStyle}`}
          >
            {pending ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
