import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Sin conexión" };

/** Shown by the service worker when a page can't be loaded because there is no signal. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-brand px-6 text-center text-[#dcdcf3]">
      <Logo size={44} />
      <h1 className="text-2xl font-semibold text-white">Sin conexión</h1>
      <p className="max-w-xs">No hay señal en este momento. Cuando vuelvas a tener internet, la app se cargará de nuevo.</p>
      {/* A full page load on purpose: client navigation would fail again without signal. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="flex h-12 items-center rounded-2xl bg-accent px-6 font-semibold text-brand-deep">
        Reintentar
      </a>
    </main>
  );
}
