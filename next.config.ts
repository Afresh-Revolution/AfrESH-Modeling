import type { NextConfig } from "next";
import path from "path";

function buildCsp() {
  const isProd = process.env.NODE_ENV === "production";

  // NOTE: Next.js commonly injects inline scripts/styles. A stricter nonce-based CSP
  // requires coordinated framework configuration, so we start with a compatible baseline.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
  ];
  const styleSrc = ["'self'", "'unsafe-inline'"];
  const fontSrc = ["'self'", "data:"];

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://res.cloudinary.com",
    "https://picsum.photos",
  ];

  // If your backend / API lives on a different origin, allow it here.
  const connectSrc = ["'self'", "https:", "wss:"];

  // Allow Font Awesome stylesheet + webfonts from cdnjs (if you load it from there).
  styleSrc.push("https://cdnjs.cloudflare.com");
  fontSrc.push("https://cdnjs.cloudflare.com");

  const directives: string[] = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `script-src ${scriptSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
  ];

  if (isProd) directives.push("upgrade-insecure-requests");

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = buildCsp();

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      // Prefer CSP `frame-ancestors` but keep XFO for older clients.
      { key: "X-Frame-Options", value: "DENY" },
      // HSTS is only meaningful over HTTPS; safe to emit only in production.
      ...(isProd
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains; preload",
            },
          ]
        : []),
      // Start compatible: enforce in prod, report-only in non-prod.
      ...(isProd
        ? [{ key: "Content-Security-Policy", value: csp }]
        : [{ key: "Content-Security-Policy-Report-Only", value: csp }]),
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
