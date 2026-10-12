"use client";

import { useEffect } from "react";

export function RegistrerServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    }
  }, []);
  return null;
}
