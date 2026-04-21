"use client";

import type { SiteMetrics } from "@/lib/siteMetrics";
import { useEffect, useMemo, useRef, useState } from "react";

type StatDef = { target: number; label: string; suffix: "plus" | "percent" };

function formatFinal(target: number, suffix: "plus" | "percent") {
  if (suffix === "percent") return `${target}%`;
  if (target > 100) return `${target.toLocaleString()}+`;
  return `${target}+`;
}

function StatNumber({
  target,
  suffix,
  active,
}: {
  target: number;
  suffix: "plus" | "percent";
  active: boolean;
}) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) return;
    const duration = 2000;
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const val = Math.floor(eased * target);
      if (suffix === "percent") setDisplay(`${val}%`);
      else if (target > 100) setDisplay(`${val.toLocaleString()}+`);
      else setDisplay(`${val}+`);
      if (progress < 1) requestAnimationFrame(update);
      else setDisplay(formatFinal(target, suffix));
    }
    requestAnimationFrame(update);
  }, [active, target, suffix]);

  return <div className="stat-number">{display}</div>;
}

function statsFromMetrics(m: SiteMetrics): StatDef[] {
  return [
    { target: m.models_represented, label: "Models Represented", suffix: "plus" },
    { target: m.campaigns_delivered, label: "Campaigns Delivered", suffix: "plus" },
    { target: m.years_excellence, label: "Years of Excellence", suffix: "plus" },
    { target: m.placement_rate_percent, label: "Placement rate", suffix: "percent" },
  ];
}

export function StatsBar({ metrics }: { metrics: SiteMetrics }) {
  const stats = useMemo(() => statsFromMetrics(metrics), [metrics]);
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setActive(true);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="stats-bar reveal" ref={ref}>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <StatNumber target={s.target} suffix={s.suffix} active={active} />
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
