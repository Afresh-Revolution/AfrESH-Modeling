import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ONYXX CLUB",
    short_name: "ONYXX",
    description: "Data-driven talent development and placement.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#c9a84c",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
