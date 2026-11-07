"use client";

import { useEffect } from "react";

export default function RegisterMemberServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Reuses the existing network-only worker. This avoids creating
      // a competing service worker that could interfere with the Admin App.
      navigator.serviceWorker
        .register("/admin-service-worker.js", { scope: "/" })
        .catch((error) => {
          console.error("DollarFetch Member App registration failed:", error);
        });
    }
  }, []);

  return null;
}
