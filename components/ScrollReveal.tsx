"use client";

import { useLayoutEffect } from "react";

function revealIfInView(el: Element) {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    el.classList.add("visible");
  }
}

export function ScrollReveal() {
  useLayoutEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const observed = new WeakSet<Element>();

    const observeReveals = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        revealIfInView(el);
        if (observed.has(el)) return;
        revealObserver.observe(el);
        observed.add(el);
      });
    };

    observeReveals();

    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewReveal = false;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.classList.contains("reveal") || node.querySelector(".reveal")) {
            hasNewReveal = true;
          }
        });
      }
      if (hasNewReveal) observeReveals();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
