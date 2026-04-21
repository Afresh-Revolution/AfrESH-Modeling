"use client";

import { useEffect, useState } from "react";

const SW_URL = "/sw.js";

export function PwaManager() {
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let updateTimer: number | null = null;
    let refreshing = false;

    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateMessage("Installing latest update...");
              registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        updateTimer = window.setInterval(() => {
          registration.update().catch(() => undefined);
        }, 60000);
      })
      .catch(() => undefined);

    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      setUpdateMessage("Update installed. Reloading...");
      window.setTimeout(() => window.location.reload(), 1200);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (updateTimer) window.clearInterval(updateTimer);
    };
  }, []);

  if (!updateMessage) return null;

  return (
    <div className="pwa-toast pwa-toast-success" role="status" aria-live="polite">
      <i className="fas fa-rotate" aria-hidden /> {updateMessage}
    </div>
  );
}
