"use client";

import { useEffect } from "react";

/** Registers the service worker for installable/offline-shell PWA support. */
export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      // Only register in production to avoid caching the dev bundle.
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          /* registration is best-effort in this MVP */
        });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
