"use client";

import { useEffect, useState } from "react";

/** Chrome/Edge/Android event that lets us show our own install button. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "hidden" | "prompt" | "ios";

/**
 * "Instalar app" button. Android and desktop Chrome get the native install dialog;
 * iPhone has no install API, so it shows how to add the app from the Share menu.
 */
export function InstallApp() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const installed = window.matchMedia("(display-mode: standalone)").matches;
    if (installed) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => setMode("hidden");

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Deferred so the state update happens after the first render.
    const timer = window.setTimeout(() => {
      if (isIos) setMode("ios");
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  if (mode === "ios") {
    return (
      <p className="rounded-xl bg-brand-soft px-3.5 py-3 text-[13px] text-brand-dark">
        <strong>Instala Rondín en tu iPhone:</strong> toca el botón <em>Compartir</em> de Safari y luego{" "}
        <em>«Agregar a inicio»</em>.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        if (!promptEvent) return;
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") setMode("hidden");
      }}
      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-brand bg-white text-[15px] font-semibold text-brand hover:bg-brand-soft"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
      Instalar app en este dispositivo
    </button>
  );
}
