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
  title: "ONYXX CLUB — Modeling Agency",
  description:
    "Where elegance meets excellence. Data-driven talent development and placement.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
