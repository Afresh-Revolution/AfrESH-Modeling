"use client";

import { useEffect } from "react";

const TRIGGER_PX = 72;

export function LandingPullToRefresh() {
  useEffect(() => {
    let startY = 0;
    let tracking = false;
    let refreshing = false;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      if (!e.touches.length) return;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking || refreshing) return;
      if (!e.touches.length) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0) {
        return;
      }
      if (delta > 6) e.preventDefault();
      if (delta >= TRIGGER_PX) {
        refreshing = true;
        tracking = false;
        window.location.reload();
      }
    };

    const onEnd = () => {
      if (!tracking || refreshing) return;
      tracking = false;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return null;
}
