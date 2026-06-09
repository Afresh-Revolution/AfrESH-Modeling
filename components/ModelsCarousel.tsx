"use client";

import type { RosterModel } from "@/lib/types";
import { imageUrlsForRow } from "@/lib/imageUrls";
import { rosterSocialLinkMeta } from "@/lib/socialUrl";
import { RotatingGalleryImage } from "@/components/RotatingGalleryImage";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const GAP_PX = 24;

export function ModelsCarousel({ models }: { models: RosterModel[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [cardStep, setCardStep] = useState(304);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  const recompute = useCallback(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || !track.children.length) return;
    const first = track.children[0] as HTMLElement;
    const step = first.offsetWidth + GAP_PX;
    setCardStep(step);
    const total = models.length * step - GAP_PX;
    const max = Math.max(0, total - wrap.clientWidth + 48);
    setMaxScroll(max);
    setPos((p) => Math.min(p, max));
  }, [models.length]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [recompute]);

  const move = useCallback(
    (dir: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const visible = Math.max(1, Math.floor(wrap.clientWidth / cardStep));
      const stepPx = visible * cardStep;
      setPos((p) =>
        Math.max(0, Math.min(p + dir * stepPx, maxScroll))
      );
    },
    [cardStep, maxScroll]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      const diff = dragStartX.current - e.clientX;
      setPos(
        Math.max(0, Math.min(dragStartPos.current + diff, maxScroll))
      );
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, maxScroll]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragStartX.current = e.clientX;
    dragStartPos.current = pos;
    setIsDragging(true);
  };

  const transition = isDragging
    ? "none"
    : "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";

  return (
    <>
      <div className="carousel-wrapper reveal" ref={wrapRef}>
        <div
          className="carousel-track"
          id="carouselTrack"
          ref={trackRef}
          style={{
            transform: `translateX(-${pos}px)`,
            transition,
            touchAction: isDragging ? "none" : "pan-y",
          }}
          onPointerDown={onPointerDown}
        >
          {models.map((m) => {
            const images = imageUrlsForRow(m);
            const socialUrl =
              typeof m.social_url === "string" && m.social_url.trim().length
                ? m.social_url.trim()
                : null;
            const socialMeta = socialUrl ? rosterSocialLinkMeta(socialUrl) : null;
            return (
              <div className="model-card" key={`${m.name}-${m.id ?? m.image_url}`}>
                <div
                  className="model-card-media"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <RotatingGalleryImage
                    images={images}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 240px, 280px"
                    className="model-card-img"
                  />
                  <div className="model-card-overlay">
                    <div className="model-card-name">{m.name}</div>
                    <div className="model-card-category">{m.category}</div>
                  </div>
                </div>
                {socialUrl && socialMeta ? (
                  <a
                    className="model-card-social-link"
                    data-platform={socialMeta.platform}
                    href={socialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on ${socialMeta.label}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className={socialMeta.iconClass} aria-hidden />
                    <span>{socialMeta.label}</span>
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="carousel-nav reveal">
        <button
          type="button"
          className="carousel-btn"
          id="carouselPrev"
          aria-label="Previous"
          onClick={() => move(-1)}
        >
          <i className="fas fa-arrow-left" aria-hidden />
        </button>
        <button
          type="button"
          className="carousel-btn"
          id="carouselNext"
          aria-label="Next"
          onClick={() => move(1)}
        >
          <i className="fas fa-arrow-right" aria-hidden />
        </button>
      </div>
    </>
  );
}
