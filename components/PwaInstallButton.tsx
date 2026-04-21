"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPlatform = "ios" | "firefox" | "chromium" | "other";

type DeferredInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __onyxxDeferredPrompt?: DeferredInstallPromptEvent;
  }
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  if (isIOS) return "ios";
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("edg/") || ua.includes("chrome/") || ua.includes("opr/") || ua.includes("brave")) {
    return "chromium";
  }
  return "other";
}

export function PwaInstallButton() {
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setInstalled(true);
    }
    if (window.__onyxxDeferredPrompt) {
      setDeferredPrompt(window.__onyxxDeferredPrompt);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as DeferredInstallPromptEvent;
      window.__onyxxDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      window.__onyxxDeferredPrompt = undefined;
      setShowHelp(false);
      window.setTimeout(() => setInstalled(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const helpText = useMemo(() => {
    if (platform === "ios") {
      return "On iPhone/iPad: open this site in Safari, tap Share, then choose 'Add to Home Screen'. Apple does not allow one-tap instant PWA install from a website button.";
    }
    if (platform === "firefox") {
      return "Firefox does not support one-click PWA install prompts. Use Edge/Chrome/Opera for native app-style install.";
    }
    if (platform === "chromium") {
      return "If the install prompt did not appear yet, open browser menu and choose 'Install app' (or 'Apps > Install this site as an app').";
    }
    return "This browser does not expose direct PWA install prompt. Use a Chromium browser (Edge/Chrome/Opera/Brave) for one-click install.";
  }, [platform]);

  async function onInstallClick() {
    const promptEvent = deferredPrompt ?? window.__onyxxDeferredPrompt ?? null;
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
      setDeferredPrompt(null);
      window.__onyxxDeferredPrompt = undefined;
      return;
    }
    setShowHelp(true);
  }

  return (
    <>
      <button type="button" className="footer-btn footer-btn-outline" onClick={onInstallClick}>
        <i className="fas fa-download" aria-hidden /> {installed ? "App Installed" : "Install App"}
      </button>

      {showHelp ? (
        <div className="footer-modal-overlay" role="presentation" onClick={() => setShowHelp(false)}>
          <div
            className="footer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="footer-modal-close"
              aria-label="Close"
              onClick={() => setShowHelp(false)}
            >
              <i className="fas fa-xmark" aria-hidden />
            </button>
            <h3 id="install-help-title">Install ONYXX App</h3>
            <p>{helpText}</p>
            <div className="footer-modal-actions">
              <button type="button" className="footer-btn footer-btn-outline" onClick={() => setShowHelp(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {installed ? (
        <div className="pwa-toast pwa-toast-success" role="status" aria-live="polite">
          <i className="fas fa-circle-check" aria-hidden /> App installed successfully.
        </div>
      ) : null}
    </>
  );
}
