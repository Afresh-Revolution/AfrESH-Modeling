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
