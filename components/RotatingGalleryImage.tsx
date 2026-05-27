"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";

const ROTATE_MS = 3000;

export function RotatingGalleryImage({
  images,
  alt,
  className,
  sizes,
  fill,
  width,
  height,
}: {
  images: string[];
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const urls = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [urls.join("|")]);

  useEffect(() => {
    if (urls.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [urls.length, urls.join("|")]);

  const openLightbox = useCallback(() => {
    if (urls.length) setLightboxOpen(true);
  }, [urls.length]);

  if (!urls.length) return null;

  const src = urls[index] ?? urls[0];
  const bypassOptimizer =
    src.includes("picsum.photos") || src.includes("res.cloudinary.com");

  const imageProps = fill
    ? { fill: true as const, sizes: sizes ?? "100vw" }
    : { width: width ?? 400, height: height ?? 550, sizes: sizes ?? "100vw" };

  return (
    <>
      <button
        type="button"
        className="rotating-gallery-hit"
        onClick={openLightbox}
        aria-label={`View full size: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          className={className}
          unoptimized={bypassOptimizer}
          {...imageProps}
        />
        {urls.length > 1 ? (
          <span className="rotating-gallery-dots" aria-hidden>
            {urls.map((_, i) => (
              <span
                key={i}
                className={`rotating-gallery-dot${i === index ? " is-active" : ""}`}
              />
            ))}
          </span>
        ) : null}
      </button>
      <ImageLightbox
        open={lightboxOpen}
        src={src}
        alt={alt}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
