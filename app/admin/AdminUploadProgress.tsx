"use client";

import { SkeletonProgress } from "@/components/skeleton/Skeleton";
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
    <SkeletonProgress
      percent={state.percent}
      className={[styles.progressWrap, className].filter(Boolean).join(" ")}
      style={style}
      label="Uploading"
    />
  );
}
