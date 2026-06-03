"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        background: "#0a0a0a",
        color: "#f5f0e8",
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
        Something went wrong
      </h1>
      <p style={{ maxWidth: 360, color: "#a09888", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        We couldn&apos;t load this page. Please refresh or try again in a moment.
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
    </main>
  );
}
