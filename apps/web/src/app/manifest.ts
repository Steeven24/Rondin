import type { MetadataRoute } from "next";

/** Web app manifest: lets phones install Rondín as an app (served at /manifest.webmanifest). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Rondín · Relevamiento de locales",
    short_name: "Rondín",
    description: "Relevamiento de locales comerciales, del Excel al informe.",
    lang: "es-EC",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f6fa",
    theme_color: "#30329b",
    categories: ["productivity", "business"],
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
