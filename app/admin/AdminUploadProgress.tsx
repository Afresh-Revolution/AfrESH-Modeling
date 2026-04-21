"use client";

import type { AdminUploadState } from "@/lib/adminMultipartUpload";
import type { CSSProperties } from "react";
import styles from "./admin.module.scss";

export function AdminUploadProgress({
  state,
  className,
  style,
}: {
  state: AdminUploadState;
  className?: string;
  style?: CSSProperties;
}) {
  if (state.kind === "idle") return null;

  if (state.kind === "error") {
    return (
      <div className={[styles.inlineError, className].filter(Boolean).join(" ")} style={style}>
        {state.message}
      </div>
    );
  }

  return (
    <div
      className={[styles.progressWrap, className].filter(Boolean).join(" ")}
      style={style}
      aria-live="polite"
    >
      <div className={styles.progressRow}>
        <span className={styles.spinner} aria-hidden="true" />
        <span style={{ fontSize: "0.8rem", color: "#a09888" }}>Uploading… {state.percent}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${state.percent}%` }} />
      </div>
    </div>
  );
}
