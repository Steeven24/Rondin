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

/**
 * - prompt: Chrome gave us its install event → "Instalar" button with the native dialog.
 * - android: no event (Chrome holds it back for a while after a dismissal) → menu instructions.
 * - ios: Apple has no install API → Share menu instructions.
 */
type Mode = "hidden" | "prompt" | "android" | "ios";

// Closing the banner hides it only until the browser is closed, so it comes back next time.
// (A new key: the old 7-day value saved in localStorage is ignored.)
const DISMISS_KEY = "rondin:install-dismissed";

function isPhoneOrTablet() {
  const ua = navigator.userAgent;
  const mobileDevice = /android|iphone|ipad|ipod|mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua));
  // Touch as the main input rules out computers, including laptops with a touch screen.
  return mobileDevice && window.matchMedia("(pointer: coarse)").matches;
}

/** Banner fixed at the bottom of the screen inviting to install the app. Phones and tablets only. */
export function InstallApp() {
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!isPhoneOrTablet() || installed || sessionStorage.getItem(DISMISS_KEY)) return;

    const showPrompt = () => window.__rondinInstallPrompt && setMode("prompt");
    const hide = () => setMode("hidden");
    window.addEventListener("rondin:installable", showPrompt);
    window.addEventListener("appinstalled", hide);

    // The event may already have fired before this component mounted; if not, show instructions.
    const timer = window.setTimeout(() => {
      if (window.__rondinInstallPrompt) setMode("prompt");
      else setMode(/iphone|ipad|ipod|macintosh/i.test(navigator.userAgent) ? "ios" : "android");
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("rondin:installable", showPrompt);
      window.removeEventListener("appinstalled", hide);
    };
  }, []);

  if (mode === "hidden") return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setMode("hidden");
  }

  async function install() {
    const event = window.__rondinInstallPrompt;
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    // Chrome's event can be used only once; if they cancel, fall back to the menu instructions.
    window.__rondinInstallPrompt = undefined;
    setMode(outcome === "accepted" ? "hidden" : "android");
  }

  const hint = {
    prompt: "Ábrela como una app, sin el navegador.",
    android: "Toca ⋮ y luego «Instalar aplicación».",
    ios: "Toca Compartir y luego «Agregar a inicio».",
  }[mode];

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
        <span className="text-xs text-muted">{hint}</span>
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
