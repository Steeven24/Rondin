import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "Rondín", template: "%s · Rondín" },
  description: "Relevamiento de locales comerciales, del Excel al informe.",
};

export const viewport: Viewport = {
  themeColor: "#30329b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${onest.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
