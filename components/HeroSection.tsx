"use client";

import { HeroCanvas } from "@/components/HeroCanvas";

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      <HeroCanvas />
      <div className="hero-overlay">
        <div className="hero-badge">
          <span className="dot" />
          Now Accepting Applications
        </div>
        <h1 className="hero-title">
          AfrESH <span>Modeling</span>
        </h1>
        <p className="hero-subtitle">Where Elegance Meets Excellence</p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => scrollToId("models")}
          >
            View Our Talent
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => scrollToId("apply")}
          >
            Apply Now
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
