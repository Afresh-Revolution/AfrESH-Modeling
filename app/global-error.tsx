"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#f5f0e8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
          Something went wrong
        </h1>
        <p style={{ maxWidth: 360, color: "#a09888", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          The site hit a problem while loading. Please refresh the page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#c9a84c",
            color: "#0a0a0a",
            border: "none",
            borderRadius: 4,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
