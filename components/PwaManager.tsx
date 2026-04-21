"use client";

import { useEffect, useState } from "react";

const SW_URL = "/sw.js";

export function PwaManager() {
  const [updateState, setUpdateState] = useState<{
    message: string;
    percent: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let updateTimer: number | null = null;
    let progressTimer: number | null = null;
    let refreshing = false;

    const startInstallingProgress = () => {
      setUpdateState({ message: "Installing latest update...", percent: 15 });
      if (progressTimer) window.clearInterval(progressTimer);
      progressTimer = window.setInterval(() => {
        setUpdateState((prev) => {
          if (!prev) return prev;
          if (prev.percent >= 90) return prev;
          return { ...prev, percent: Math.min(90, prev.percent + 8) };
        });
      }, 450);
    };

    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        if (registration.waiting) {
          startInstallingProgress();
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              startInstallingProgress();
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
      if (progressTimer) window.clearInterval(progressTimer);
      setUpdateState({ message: "Update installed. Reloading...", percent: 100 });
      window.setTimeout(() => window.location.reload(), 1200);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (updateTimer) window.clearInterval(updateTimer);
      if (progressTimer) window.clearInterval(progressTimer);
    };
  }, []);

  if (!updateState) return null;

  return (
    <div className="pwa-update-card" role="status" aria-live="polite">
      <div className="pwa-update-row">
        <span className="pwa-update-spinner" aria-hidden="true" />
        <span className="pwa-update-text">
          {updateState.message} {updateState.percent}%
        </span>
      </div>
      <div className="pwa-update-track">
        <div className="pwa-update-bar" style={{ width: `${updateState.percent}%` }} />
      </div>
    </div>
  );
}
