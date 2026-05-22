import { BRAND_LOGO_MIME, BRAND_LOGO_SRC } from "@/lib/brand";
import type { MetadataRoute } from "next";

const SITE_ORIGIN =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://afreshmodeling.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfrESH Modeling",
    short_name: "AfrESH",
    description: "Data-driven talent development and placement.",
    id: `${SITE_ORIGIN}/`,
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    display_override: ["standalone", "window-controls-overlay", "minimal-ui"],
    prefer_related_applications: false,
    categories: ["business", "lifestyle"],
    background_color: "#0b0b0d",
    theme_color: "#c9a84c",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: BRAND_LOGO_SRC,
        sizes: "500x500",
        type: BRAND_LOGO_MIME,
        purpose: "any",
      },
    ],
  };
}
