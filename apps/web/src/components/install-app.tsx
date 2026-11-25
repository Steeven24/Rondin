"use client";

import { useEffect, useState } from "react";

/** Chrome/Edge/Android event that lets us show our own install banner. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    /** Saved by the inline script in the root layout (the event can fire before hydration). */
    __rondinInstallPrompt?: BeforeInstallPromptEvent;
  }
}

type Mode = "hidden" | "prompt" | "ios";

const DISMISS_KEY = "rondin:install-dismissed-at";
const DISMISS_DAYS = 7;

function recentlyDismissed() {
  const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Banner fixed at the bottom of the screen inviting to install the app.
 * Android/desktop Chrome: native install dialog. iPhone: instructions (Apple has no install API).
 * "Ahora no" hides it for 7 days.
 */
export function InstallApp() {
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // Only on phones and tablets: on a computer the app is used in the browser.
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1 && /macintosh/i.test(navigator.userAgent);
    if (!isMobile || installed || recentlyDismissed()) return;

    const showPrompt = () => window.__rondinInstallPrompt && setMode("prompt");
    const hide = () => setMode("hidden");
    window.addEventListener("rondin:installable", showPrompt);
    window.addEventListener("appinstalled", hide);

    // The event may already have fired before this component mounted.
    const timer = window.setTimeout(() => {
      if (window.__rondinInstallPrompt) setMode("prompt");
      else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) setMode("ios");
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("rondin:installable", showPrompt);
      window.removeEventListener("appinstalled", hide);
    };
  }, []);

  if (mode === "hidden") return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode("hidden");
  }

  async function install() {
    const event = window.__rondinInstallPrompt;
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    window.__rondinInstallPrompt = undefined;
    if (outcome === "accepted") setMode("hidden");
    else dismiss();
  }

  return (
    <aside
      aria-label="Instalar la aplicación"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-lg"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" fill="#ffc600" stroke="#ffc600" />
        </svg>
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold text-ink">Instala Rondín en tu celular</span>
        <span className="text-xs text-muted">
          {mode === "ios" ? "Toca Compartir y luego «Agregar a inicio»." : "Ábrela como una app, sin el navegador."}
        </span>
      </div>
      {mode === "prompt" && (
        <button type="button" onClick={install} className="h-10 shrink-0 rounded-xl bg-brand px-3.5 text-sm font-semibold text-white">
          Instalar
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Ahora no"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-soft"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </aside>
  );
}
