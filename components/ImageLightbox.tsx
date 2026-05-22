"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ImageLightbox({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !src || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="image-lightbox-close"
        aria-label="Close"
        onClick={onClose}
      >
        <i className="fas fa-xmark" aria-hidden />
      </button>
      <div className="image-lightbox-frame" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="image-lightbox-img"
          unoptimized={src.includes("picsum.photos")}
          priority
        />
      </div>
    </div>,
    document.body,
  );
}
