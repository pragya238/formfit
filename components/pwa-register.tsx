"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installing the app is optional; the web experience still works if
        // a browser blocks service workers.
      });
    }
  }, []);

  return null;
}
