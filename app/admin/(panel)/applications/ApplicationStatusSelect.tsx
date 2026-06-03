"use client";

import { AdminConfirmDialog } from "../AdminConfirmDialog";
import {
  setApplicationStatus,
  type SetApplicationStatusResult,
} from "../../actions";
import styles from "../../admin.module.scss";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const STATUSES = [
  "new",
  "reviewed",
  "shortlisted",
  "rejected",
  "accepted",
  "denied",
  "archived",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  accepted: "Accepted",
  denied: "Denied",
  archived: "Archived",
};

const EMAIL_CONFIRM: Partial<
  Record<
    Status,
    {
      title: string;
      body: string;
      confirmLabel: string;
      variant: "danger" | "gold";
    }
  >
> = {
  rejected: {
    title: "Reject this application?",
    body: "The applicant will receive an email letting them know their application will not move forward.",
    confirmLabel: "Reject and send email",
    variant: "danger",
  },
  accepted: {
    title: "Accept into the agency?",
    body: "The applicant will receive a welcome email. You will contact them when sessions begin.",
    confirmLabel: "Accept and send email",
    variant: "gold",
  },
  denied: {
    title: "Deny after audition?",
    body: "The applicant will receive an email letting them know they were not accepted following their interview.",
    confirmLabel: "Deny and send email",
    variant: "danger",
  },
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<Status | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const interviewDialogRef = useRef<HTMLDialogElement>(null);
  const modalId = useId();

  useEffect(() => {
    setLocalValue(value || "new");
  }, [value]);

  function closeConfirm() {
    if (pending) return;
    setConfirmOpen(false);
    setConfirmStatus(null);
    setConfirmError(null);
  }

  function applyResult(result: SetApplicationStatusResult, onSuccess?: () => void) {
    if (!result.ok) {
      setActionError(result.error);
      setConfirmError(result.error);
      return;
    }
    setActionError(null);
    setConfirmError(null);
    if (result.emailError) {
      setEmailNote(result.emailError);
    } else {
      setEmailNote(null);
    }
    onSuccess?.();
  }

  const confirmMeta = confirmStatus ? EMAIL_CONFIRM[confirmStatus] : null;

  return (
    <div style={{ minWidth: 140 }}>
      <select
        className={styles.select}
        disabled={pending}
        value={localValue}
        onChange={(e) => {
          const next = e.target.value as Status;
          setEmailNote(null);
          setActionError(null);

          if (next === "shortlisted") {
            queueMicrotask(() => interviewDialogRef.current?.showModal());
            return;
          }

          const meta = EMAIL_CONFIRM[next];
          if (meta) {
            setConfirmStatus(next);
            setConfirmError(null);
            setConfirmOpen(true);
            return;
          }

          start(async () => {
            const r = await setApplicationStatus(id, next);
            applyResult(r, () => setLocalValue(next));
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

      {actionError && !confirmOpen ? (
        <p className={styles.inlineError} style={{ marginTop: "0.35rem", fontSize: "0.72rem" }}>
          {actionError}
        </p>
      ) : null}

      {confirmMeta && confirmStatus ? (
        <AdminConfirmDialog
          open={confirmOpen}
          title={confirmMeta.title}
          confirmLabel={confirmMeta.confirmLabel}
          variant={confirmMeta.variant}
          pending={pending}
          error={confirmError}
          onCancel={closeConfirm}
          onConfirm={() => {
            setConfirmError(null);
            start(async () => {
              const r = await setApplicationStatus(id, confirmStatus);
              applyResult(r, () => {
                setLocalValue(confirmStatus);
                setConfirmOpen(false);
                setConfirmStatus(null);
              });
            });
          }}
        >
          {confirmMeta.body}
        </AdminConfirmDialog>
      ) : null}

      <dialog
        ref={interviewDialogRef}
        id={modalId}
        className={styles.shortlistDialog}
        onClick={(ev) => {
          if (ev.target === interviewDialogRef.current) interviewDialogRef.current?.close();
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
              applyResult(r, () => {
                setLocalValue("shortlisted");
                interviewDialogRef.current?.close();
              });
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
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              disabled={pending}
              onClick={() => interviewDialogRef.current?.close()}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnGold}`} disabled={pending}>
              {pending ? "Saving…" : "Confirm and email"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
