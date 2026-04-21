import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ONYXX CLUB",
    short_name: "ONYXX",
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
        src: "/pwa-logo.JPG",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/pwa-logo.JPG",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}
