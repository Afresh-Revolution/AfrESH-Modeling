"use client";

import { useId, useRef, useState, useTransition } from "react";
import { deleteApplication } from "../../actions";
import styles from "../../admin.module.scss";

export function ApplicationDeleteButton({
  id,
  name,
}: {
  id: string;
  name?: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;

  function openDialog() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (pending) return;
    dialogRef.current?.close();
  }

  function confirmDelete() {
    start(async () => {
      const res = await deleteApplication(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      dialogRef.current?.close();
    });
  }

  const displayName = name?.trim() ? name.trim() : null;

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnDanger}`}
        onClick={openDialog}
        disabled={pending}
        aria-label={
          displayName
            ? `Delete submission from ${displayName}`
            : "Delete submission"
        }
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.confirmDialog}
        aria-labelledby={titleId}
        onClick={(ev) => {
          if (ev.target === dialogRef.current && !pending) {
            dialogRef.current?.close();
          }
        }}
        onCancel={(ev) => {
          if (pending) ev.preventDefault();
        }}
        onClose={() => setError(null)}
      >
        <h3 id={titleId} className={styles.confirmDialogTitle}>
          Delete submission?
        </h3>
        <p className={styles.confirmDialogBody}>
          {displayName ? (
            <>
              This permanently removes the application from{" "}
              <strong>{displayName}</strong>. This action cannot be undone.
            </>
          ) : (
            <>
              This permanently removes the application. This action cannot be
              undone.
            </>
          )}
        </p>

        {error ? (
          <p className={styles.confirmDialogError} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.confirmDialogActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={closeDialog}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={confirmDelete}
            disabled={pending}
            autoFocus
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
