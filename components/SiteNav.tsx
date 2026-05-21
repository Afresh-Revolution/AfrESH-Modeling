"use client";

import { LogoSvg } from "@/components/LogoSvg";
import { useCallback, useEffect, useState } from "react";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    document.body.style.overflow = "";
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => {
      const next = !open;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <>
      <nav
        className={`nav-main${scrolled ? " scrolled" : ""}`}
        id="mainNav"
      >
        <a href="#hero" className="nav-logo" aria-label="AfrESH Modeling home">
          <LogoSvg alt="" priority />
        </a>
        <div className="nav-links">
          <a href="#models">Models</a>
          <a href="#hire-models">Hiring</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#data">Insights</a>
          <a href="#film">Film</a>
          <a href="#gallery">Editorial</a>
          <a href="#apply">Apply</a>
          <button
            type="button"
            className="nav-cta"
            onClick={() => scrollToId("apply")}
          >
            Join Us
          </button>
        </div>
        <button
          type="button"
          className={`mobile-menu-btn${mobileOpen ? " is-open" : ""}`}
          id="mobileMenuBtn"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobileNav"
          onClick={toggleMobile}
        >
          <span className="mobile-menu-icon" aria-hidden>
            <span className="mobile-menu-line" />
            <span className="mobile-menu-line" />
            <span className="mobile-menu-line" />
          </span>
        </button>
      </nav>

      <div
        className={`mobile-nav${mobileOpen ? " active" : ""}`}
        id="mobileNav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <a href="#models" onClick={closeMobile}>
          Models
        </a>
        <a href="#hire-models" onClick={closeMobile}>
          Hiring
        </a>
        <a href="#ecosystem" onClick={closeMobile}>
          Ecosystem
        </a>
        <a href="#data" onClick={closeMobile}>
          Insights
        </a>
        <a href="#film" onClick={closeMobile}>
          Film
        </a>
        <a href="#gallery" onClick={closeMobile}>
          Editorial
        </a>
        <a href="#apply" onClick={closeMobile}>
          Apply
        </a>
      </div>
    </>
  );
}
