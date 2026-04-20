"use client";

import { updateApplicationInterview } from "../../actions";
import styles from "../../admin.module.scss";
import { useEffect, useState, useTransition } from "react";

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplay(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ApplicationInterviewCell({
  id,
  status,
  interviewAt,
}: {
  id: string;
  status: string;
  interviewAt: string | null | undefined;
}) {
  const [pending, start] = useTransition();
  const [localIso, setLocalIso] = useState<string | null>(
    interviewAt && String(interviewAt).length ? String(interviewAt) : null
  );
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLocalIso(interviewAt && String(interviewAt).length ? String(interviewAt) : null);
  }, [interviewAt]);

  if (status !== "shortlisted") {
    return <span style={{ color: "#555" }}>—</span>;
  }

  return (
    <div style={{ minWidth: 200 }}>
      {!editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.8rem" }}>{formatDisplay(localIso)}</span>
          <button
            type="button"
            className={styles.linkButton}
            disabled={pending}
            onClick={() => {
              setErr(null);
              setEditing(true);
            }}
          >
            {localIso ? "Change interview" : "Set interview time"}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const raw = String(fd.get("interview_local") ?? "");
            if (!raw) {
              setErr("Pick a date and time.");
              return;
            }
            const iso = new Date(raw).toISOString();
            start(async () => {
              setErr(null);
              const r = await updateApplicationInterview(id, iso);
              if (!r.ok) {
                setErr(r.error);
                return;
              }
              setLocalIso(iso);
              setEditing(false);
            });
          }}
        >
          <label className={styles.srOnly} htmlFor={`int-${id}`}>
            Interview date and time
          </label>
          <input
            id={`int-${id}`}
            name="interview_local"
            type="datetime-local"
            className={styles.input}
            style={{ fontSize: "0.8rem", marginBottom: "0.35rem", maxWidth: "100%" }}
            defaultValue={toDatetimeLocalValue(localIso)}
            required
          />
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            <button type="submit" className={`${styles.btn} ${styles.btnGold}`} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setErr(null);
              }}
            >
              Cancel
            </button>
          </div>
          {err ? <p className={styles.inlineError}>{err}</p> : null}
        </form>
      )}
    </div>
  );
}
