"use client";

import { PWA_DISPLAY_NAME } from "@/lib/brand";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type InstallPlatform = "ios" | "firefox" | "chromium" | "other";

type DeferredInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __afreshDeferredPrompt?: DeferredInstallPromptEvent;
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
  const [installedApp, setInstalledApp] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setInstalledApp(true);
    }
    if (window.__afreshDeferredPrompt) {
      setDeferredPrompt(window.__afreshDeferredPrompt);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as DeferredInstallPromptEvent;
      window.__afreshDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const onInstalled = () => {
      setInstalledApp(true);
      setDeferredPrompt(null);
      window.__afreshDeferredPrompt = undefined;
      setShowHelp(false);
      setShowSuccessToast(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showSuccessToast) return;
    const timer = window.setTimeout(() => setShowSuccessToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showSuccessToast]);

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
    const promptEvent = deferredPrompt ?? window.__afreshDeferredPrompt ?? null;
    if (promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
      setDeferredPrompt(null);
      window.__afreshDeferredPrompt = undefined;
      return;
    }
    setShowHelp(true);
  }

  return (
    <>
      <button type="button" className="footer-btn footer-btn-outline" onClick={onInstallClick}>
        <i className="fas fa-download" aria-hidden /> {installedApp ? "App Installed" : "Install App"}
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
            <h3 id="install-help-title">Install {PWA_DISPLAY_NAME}</h3>
            <p>{helpText}</p>
            <div className="footer-modal-actions">
              <button type="button" className="footer-btn footer-btn-outline" onClick={() => setShowHelp(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessToast && typeof document !== "undefined"
        ? createPortal(
            <div className="pwa-toast pwa-toast-success" role="status" aria-live="polite">
              <i className="fas fa-circle-check" aria-hidden /> App installed successfully.
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
