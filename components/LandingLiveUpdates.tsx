"use client";

import { subscribeToContentUpdates } from "@/lib/contentSync";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function LandingLiveUpdates() {
  const router = useRouter();
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    return subscribeToContentUpdates(() => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 1200) return;
      lastRefreshRef.current = now;
      router.refresh();
    });
  }, [router]);

  return null;
}
