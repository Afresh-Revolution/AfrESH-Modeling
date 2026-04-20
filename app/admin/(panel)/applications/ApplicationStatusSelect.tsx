"use client";

import {
  setApplicationStatus,
  type SetApplicationStatusResult,
} from "../../actions";
import styles from "../../admin.module.scss";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const STATUSES = ["new", "reviewed", "shortlisted", "rejected", "archived"] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  archived: "Archived",
};

function defaultInterviewLocal(): string {
  const d = new Date(Date.now() + 86400000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ApplicationStatusSelect({
  id,
  value,
}: {
  id: string;
  value: string;
}) {
  const [pending, start] = useTransition();
  const [localValue, setLocalValue] = useState(value || "new");
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalId = useId();

  useEffect(() => {
    setLocalValue(value || "new");
  }, [value]);

  function applyResult(result: SetApplicationStatusResult) {
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    if (result.emailError) {
      setEmailNote(result.emailError);
    } else {
      setEmailNote(null);
    }
  }

  return (
    <div style={{ minWidth: 140 }}>
      <select
        className={styles.select}
        disabled={pending}
        value={localValue}
        onChange={(e) => {
          const next = e.target.value;
          setEmailNote(null);
          if (next === "shortlisted") {
            queueMicrotask(() => dialogRef.current?.showModal());
            return;
          }
          if (next === "rejected") {
            if (
              !window.confirm(
                "Mark as rejected and send the rejection email to this applicant?"
              )
            ) {
              return;
            }
            start(async () => {
              const r = await setApplicationStatus(id, "rejected");
              applyResult(r);
              if (r.ok) setLocalValue("rejected");
            });
            return;
          }
          start(async () => {
            const r = await setApplicationStatus(id, next);
            applyResult(r);
            if (r.ok) setLocalValue(next);
          });
        }}
        aria-label="Submission status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {emailNote ? (
        <p className={styles.inlineError} style={{ marginTop: "0.35rem", fontSize: "0.72rem" }}>
          {emailNote}
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        id={modalId}
        className={styles.shortlistDialog}
        onClick={(ev) => {
          if (ev.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const raw = String(fd.get("interview_local") ?? "");
            if (!raw) return;
            const iso = new Date(raw).toISOString();
            start(async () => {
              const r = await setApplicationStatus(id, "shortlisted", iso);
              applyResult(r);
              if (r.ok) {
                setLocalValue("shortlisted");
                dialogRef.current?.close();
              }
            });
          }}
        >
          <h3 className={styles.shortlistDialogTitle}>Schedule interview</h3>
          <p className={styles.shortlistDialogHint}>
            Pick a date and time. We&apos;ll email the applicant that they&apos;re shortlisted and
            include this slot.
          </p>
          <label className={styles.label} htmlFor={`${modalId}-dt`}>
            Interview date &amp; time
          </label>
          <input
            id={`${modalId}-dt`}
            name="interview_local"
            type="datetime-local"
            className={styles.input}
            required
            defaultValue={defaultInterviewLocal()}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnGold}`} disabled={pending}>
              {pending ? "Saving…" : "Confirm & email"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
