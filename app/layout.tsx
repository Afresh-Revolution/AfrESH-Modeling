import {
  APPLE_TOUCH_ICON,
  BRAND_LOGO_SRC,
  PWA_DISPLAY_NAME,
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_THEME_COLOR,
} from "@/lib/brand";
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
  applicationName: PWA_DISPLAY_NAME,
  appleWebApp: {
    capable: true,
    title: PWA_DISPLAY_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: PWA_ICON_192, sizes: "192x192", type: "image/png" },
      { url: PWA_ICON_512, sizes: "512x512", type: "image/png" },
      { url: BRAND_LOGO_SRC, sizes: "500x500", type: "image/png" },
    ],
    apple: APPLE_TOUCH_ICON,
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
        <meta name="theme-color" content={PWA_THEME_COLOR} />
        <link rel="apple-touch-icon" href={APPLE_TOUCH_ICON} />
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
