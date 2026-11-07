"use client";

import { useEffect } from "react";

export default function RegisterAdminServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-service-worker.js", {
          scope: "/",
        })
        .catch((error) => {
          console.error("Admin app registration failed:", error);
        });
    }
  }, []);

  return null;
}
