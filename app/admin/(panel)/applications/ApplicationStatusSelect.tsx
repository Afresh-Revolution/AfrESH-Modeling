"use client";

import { setApplicationStatus } from "../../actions";
import styles from "../../admin.module.scss";
import { useTransition } from "react";

const STATUSES = ["new", "reviewed", "shortlisted", "rejected", "archived"] as const;

const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  archived: "Archived",
};

export function ApplicationStatusSelect({
  id,
  value,
}: {
  id: string;
  value: string;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      className={styles.select}
      disabled={pending}
      value={value || "new"}
      onChange={(e) => {
        start(async () => {
          await setApplicationStatus(id, e.target.value);
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
  );
}
