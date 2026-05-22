import { BRAND_LOGO_SRC } from "@/lib/brand";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PwaManager } from "@/components/PwaManager";
import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";
import "./globals.scss";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AfrESH Modeling — Modeling Agency",
  description:
    "Where elegance meets excellence. Data-driven talent development and placement.",
  manifest: "/manifest.webmanifest",
  applicationName: "AfrESH",
  appleWebApp: {
    capable: true,
    title: "AfrESH",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: BRAND_LOGO_SRC, sizes: "500x500", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${nunito.variable}`}>
      <head>
        <meta name="theme-color" content="#c9a84c" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <PwaManager />
        <ScrollReveal />
        <div className="main-shell">{children}</div>
      </body>
    </html>
  );
}
