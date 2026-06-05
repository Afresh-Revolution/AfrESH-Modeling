"use client";

import { SkeletonButton } from "@/components/skeleton/Skeleton";
import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "../admin.module.scss";

export type AdminConfirmVariant = "danger" | "gold";

export function AdminConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "gold",
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: AdminConfirmVariant;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const dialogClass =
    variant === "danger"
      ? styles.confirmDialog
      : `${styles.confirmDialog} ${styles.confirmDialogGold}`;

  const titleClass =
    variant === "danger"
      ? styles.confirmDialogTitle
      : `${styles.confirmDialogTitle} ${styles.confirmDialogTitleGold}`;

  return (
    <dialog
      ref={dialogRef}
      className={dialogClass}
      aria-labelledby={titleId}
      onClick={(ev) => {
        if (ev.target === dialogRef.current && !pending) onCancel();
      }}
      onCancel={(ev) => {
        if (pending) ev.preventDefault();
        else onCancel();
      }}
    >
      <h3 id={titleId} className={titleClass}>
        {title}
      </h3>
      <div className={styles.confirmDialogBody}>{children}</div>

      {error ? (
        <p className={styles.confirmDialogError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.confirmDialogActions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={onCancel}
          disabled={pending}
        >
          {cancelLabel}
        </button>
        <SkeletonButton
          type="button"
          className={`${styles.btn} ${variant === "danger" ? styles.btnDanger : styles.btnGold}`}
          onClick={onConfirm}
          loading={pending}
          loadingLabel="Please wait"
          autoFocus
        >
          {confirmLabel}
        </SkeletonButton>
      </div>
    </dialog>
  );
}
