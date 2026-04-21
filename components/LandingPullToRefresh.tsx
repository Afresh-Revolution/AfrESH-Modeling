"use client";

import { useEffect, useState } from "react";

const TRIGGER_PX = 72;
const MAX_PULL_PX = 120;

export function LandingPullToRefresh() {
  const [pullPx, setPullPx] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let startY = 0;
    let tracking = false;
    let refreshing = false;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      if (!e.touches.length) return;
      startY = e.touches[0].clientY;
      tracking = true;
      setActive(true);
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking || refreshing) return;
      if (!e.touches.length) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0) {
        setPullPx(0);
        return;
      }
      const next = Math.min(MAX_PULL_PX, Math.round(delta));
      setPullPx(next);
      if (delta > 6) e.preventDefault();
    };

    const onEnd = () => {
      if (!tracking || refreshing) return;
      tracking = false;
      if (pullPx >= TRIGGER_PX) {
        refreshing = true;
        setPullPx(MAX_PULL_PX);
        setActive(true);
        window.location.reload();
        return;
      }
      setPullPx(0);
      setActive(false);
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
  }, [pullPx]);

  const progress = Math.min(100, Math.round((pullPx / TRIGGER_PX) * 100));
  const visible = active || pullPx > 0;

  return (
    <div className={`pull-refresh ${visible ? "show" : ""}`} aria-hidden={!visible}>
      <div className="pull-refresh-row">
        <span className="pull-refresh-spinner" />
        <span className="pull-refresh-text">
          {progress >= 100 ? "Release to refresh" : "Pull down to refresh"} {progress}%
        </span>
      </div>
      <div className="pull-refresh-track">
        <div className="pull-refresh-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
