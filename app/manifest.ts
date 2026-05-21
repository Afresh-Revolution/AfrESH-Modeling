import { BRAND_LOGO_MIME, BRAND_LOGO_SRC } from "@/lib/brand";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfrESH Modeling",
    short_name: "AfrESH",
    description: "Data-driven talent development and placement.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    prefer_related_applications: false,
    background_color: "#0b0b0d",
    theme_color: "#c9a84c",
    orientation: "portrait",
    icons: [
      {
        src: BRAND_LOGO_SRC,
        sizes: "1024x1024",
        type: BRAND_LOGO_MIME,
        purpose: "any",
      },
      {
        src: BRAND_LOGO_SRC,
        sizes: "1024x1024",
        type: BRAND_LOGO_MIME,
        purpose: "maskable",
      },
    ],
  };
}
