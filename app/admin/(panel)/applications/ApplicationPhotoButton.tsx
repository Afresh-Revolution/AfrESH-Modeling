"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../../admin.module.scss";

function normalizePhotoUrls(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((u): u is string => typeof u === "string" && u.length > 0);
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).filter(
      (u): u is string => typeof u === "string" && u.length > 0
    );
  }
  return [];
}

export function ApplicationPhotoButton({
  photoUrls,
  label,
}: {
  photoUrls: unknown;
  label: string;
}) {
  const urls = normalizePhotoUrls(photoUrls);
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const lightboxOpenRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    lightboxOpenRef.current = lightboxIndex !== null;
  }, [lightboxIndex]);

  const closeDialog = useCallback(() => {
    setLightboxIndex(null);
    dialogRef.current?.close();
    setOpen(false);
  }, []);

  const closeLightbox = useCallback(async () => {
    const el = fullscreenRef.current;
    if (document.fullscreenElement && document.fullscreenElement === el) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => {
      setOpen(false);
      setLightboxIndex(null);
    };
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void closeLightbox();
      }
      if (e.key === "ArrowLeft" && urls.length > 1) {
        setLightboxIndex((i) => (i === null ? i : (i - 1 + urls.length) % urls.length));
      }
      if (e.key === "ArrowRight" && urls.length > 1) {
        setLightboxIndex((i) => (i === null ? i : (i + 1) % urls.length));
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxIndex, urls.length, closeLightbox]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const el = fullscreenRef.current;
    if (!el || !document.fullscreenEnabled) return;
    if (document.fullscreenElement === el) return;
    void el.requestFullscreen().catch(() => {
      /* fixed overlay still fills the viewport */
    });
  }, [lightboxIndex]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && lightboxOpenRef.current) {
        setLightboxIndex(null);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (urls.length === 0) {
    return <span style={{ color: "#666" }}>None</span>;
  }

  const lightboxSrc = lightboxIndex !== null ? urls[lightboxIndex] : null;

  const fullscreenLayer =
    lightboxSrc !== null &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={fullscreenRef}
        className={styles.photoFullscreen}
        role="dialog"
        aria-modal="true"
        aria-label="Photo full screen"
        onClick={(e) => {
          if (e.target === e.currentTarget) void closeLightbox();
        }}
      >
        <button
          type="button"
          className={styles.photoFullscreenClose}
          onClick={() => void closeLightbox()}
          aria-label="Close full screen"
        >
          ×
        </button>
        {urls.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.photoFullscreenNav} ${styles.photoFullscreenNavPrev}`}
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) =>
                  i === null ? i : (i - 1 + urls.length) % urls.length
                );
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.photoFullscreenNav} ${styles.photoFullscreenNavNext}`}
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? i : (i + 1) % urls.length));
              }}
            >
              ›
            </button>
            <div className={styles.photoFullscreenCounter} aria-live="polite">
              {lightboxIndex! + 1} / {urls.length}
            </div>
          </>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- full-screen viewer needs native img */}
        <img src={lightboxSrc} alt="" className={styles.photoFullscreenImg} />
      </div>,
      document.body
    );

  return (
    <>
      <button
        type="button"
        className={styles.linkButton}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        {label}
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        className={styles.photoDialog}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        <div className={styles.photoDialogInner}>
          <div className={styles.photoDialogHeader}>
            <h2 className={styles.photoDialogTitle}>Submitted photos</h2>
            <button type="button" className={styles.photoDialogClose} onClick={closeDialog} aria-label="Close">
              ×
            </button>
          </div>
          <p className={styles.photoDialogHint}>Click a photo to view it full screen.</p>
          <div className={styles.photoDialogGrid}>
            {urls.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className={styles.photoDialogThumb}
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={src}
                  alt=""
                  width={280}
                  height={360}
                  className={styles.photoDialogImg}
                  unoptimized={src.includes("cloudinary.com") || src.includes("picsum")}
                />
              </button>
            ))}
          </div>
        </div>
      </dialog>

      {fullscreenLayer}
    </>
  );
}
