import {
  APPLE_TOUCH_ICON,
  PWA_BACKGROUND_COLOR,
  PWA_DISPLAY_NAME,
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_ICON_MASKABLE,
  PWA_THEME_COLOR,
} from "@/lib/brand";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA_DISPLAY_NAME,
    short_name: PWA_DISPLAY_NAME,
    description: "Data-driven talent development and placement.",
    // Keep id same-origin in every environment (localhost, preview, production).
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    display_override: ["standalone", "window-controls-overlay", "minimal-ui"],
    prefer_related_applications: false,
    categories: ["business", "lifestyle"],
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    orientation: "portrait",
    icons: [
      {
        src: PWA_ICON_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APPLE_TOUCH_ICON,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_MASKABLE,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
