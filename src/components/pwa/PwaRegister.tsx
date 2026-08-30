"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after window load
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("AURA PWA: ServiceWorker registered successfully:", registration.scope);
          })
          .catch((err) => {
            console.warn("AURA PWA: ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
