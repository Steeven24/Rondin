"use client";

import { useEffect } from "react";

/** Registers /sw.js in production (in development it would cache stale builds). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not critical: the app works without it, it just can't be installed.
    });
  }, []);
  return null;
}
