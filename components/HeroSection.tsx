"use client";

import { HeroCanvas } from "@/components/HeroCanvas";
import type { LandingContent } from "@/lib/landingContent";

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection({ content }: { content: LandingContent }) {
  return (
    <section className="hero-section" id="hero">
      <HeroCanvas />
      <div className="hero-overlay">
        <div className="hero-badge">
          <span className="dot" />
          {content.hero_badge}
        </div>
        <h1 className="hero-title">
          {content.hero_title_prefix} <span>{content.hero_title_highlight}</span>
        </h1>
        <p className="hero-subtitle">{content.hero_subtitle}</p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => scrollToId("models")}
          >
            {content.hero_primary_cta}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => scrollToId("apply")}
          >
            {content.hero_secondary_cta}
          </button>
        </div>
      </div>
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
