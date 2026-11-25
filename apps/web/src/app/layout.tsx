import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "Rondín", template: "%s · Rondín" },
  description: "Relevamiento de locales comerciales, del Excel al informe.",
  applicationName: "Rondín",
  // iPhone: open full screen when launched from the home screen.
  appleWebApp: { capable: true, title: "Rondín", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#30329b",
  width: "device-width",
  initialScale: 1,
};

/**
 * Chrome fires `beforeinstallprompt` only once and often before React hydrates, so a listener
 * added in a component can miss it. This tiny inline script keeps the event for the install banner.
 */
const CAPTURE_INSTALL_PROMPT = `
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  window.__rondinInstallPrompt = e;
  window.dispatchEvent(new Event("rondin:installable"));
});
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${onest.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CAPTURE_INSTALL_PROMPT }} />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
