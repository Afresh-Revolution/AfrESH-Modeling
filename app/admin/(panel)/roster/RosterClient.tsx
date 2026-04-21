"use client";

import { AdminUploadProgress } from "@/app/admin/AdminUploadProgress";
import {
  type AdminUploadState,
  parseAdminUploadError,
  xhrMultipartWithProgress,
} from "@/lib/adminMultipartUpload";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "../../admin.module.scss";

type RosterRow = Record<string, unknown>;

function deleteEmptyFileField(fd: FormData, key: string) {
  const v = fd.get(key);
  if (v instanceof File && v.size <= 0) fd.delete(key);
}

function RowUpdateForm({ m }: { m: RosterRow }) {
  const id = String(m.id);
  const router = useRouter();
  const [upload, setUpload] = useState<AdminUploadState>({ kind: "idle" });
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        setUpload({ kind: "uploading", percent: 0 });
        try {
          const form = e.currentTarget;
          const fd = new FormData(form);
          deleteEmptyFileField(fd, "image");
          await xhrMultipartWithProgress({
            method: "PATCH",
            url: `/api/admin/roster/${encodeURIComponent(id)}`,
            formData: fd,
            onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
          });
          setUpload({ kind: "idle" });
          router.refresh();
        } catch (err) {
          setUpload({
            kind: "error",
            message: err instanceof Error ? err.message : "Save failed",
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div
        className={styles.formGrid}
        style={{ gridTemplateColumns: "1fr 1fr", minWidth: "280px" }}
      >
        <div>
          <label className={styles.label}>Name</label>
          <input name="name" className={styles.input} defaultValue={String(m.name)} />
        </div>
        <div>
          <label className={styles.label}>Category</label>
          <input name="category" className={styles.input} defaultValue={String(m.category)} />
        </div>
        <div>
          <label className={styles.label}>Display order</label>
          <input
            name="sort_order"
            type="number"
            className={styles.input}
            defaultValue={Number(m.sort_order ?? 0)}
          />
        </div>
        <div>
          <label className={styles.label}>New image</label>
          <input name="image" type="file" accept="image/*" className={styles.file} />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`${styles.btn} ${styles.btnGold}`}
        style={{ marginTop: "0.5rem" }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <AdminUploadProgress state={upload} style={{ marginTop: "0.5rem" }} />
    </form>
  );
}

export default function RosterClient({ initialRoster }: { initialRoster: RosterRow[] }) {
  const router = useRouter();
  const roster = useMemo(() => initialRoster ?? [], [initialRoster]);
  const [createUpload, setCreateUpload] = useState<AdminUploadState>({ kind: "idle" });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Roster</h1>
      <p className={styles.adminSubtitle}>
        Upload the main photo for each talent card. Files are saved automatically when you submit the
        form.
      </p>

      {deleteError ? (
        <p className={styles.inlineError} style={{ marginBottom: "1rem" }}>
          {deleteError}
        </p>
      ) : null}

      <div className={styles.card}>
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem" }}>
          Add model
        </h2>
        <form
          style={{ marginTop: "1rem" }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (creating) return;
            setCreating(true);
            setDeleteError(null);
            setCreateUpload({ kind: "uploading", percent: 0 });
            try {
              const form = e.currentTarget;
              const fd = new FormData(form);
              await xhrMultipartWithProgress({
                method: "POST",
                url: "/api/admin/roster",
                formData: fd,
                onProgress: (p) => setCreateUpload({ kind: "uploading", percent: p }),
              });
              setCreateUpload({ kind: "idle" });
              form.reset();
              router.refresh();
            } catch (err) {
              setCreateUpload({
                kind: "error",
                message: err instanceof Error ? err.message : "Upload failed",
              });
            } finally {
              setCreating(false);
            }
          }}
        >
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label} htmlFor="new-name">
                Name
              </label>
              <input
                id="new-name"
                name="name"
                className={styles.input}
                required
                placeholder="Full name"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-category">
                Category
              </label>
              <input
                id="new-category"
                name="category"
                className={styles.input}
                required
                placeholder="Editorial, Runway…"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-sort">
                Display order
              </label>
              <input
                id="new-sort"
                name="sort_order"
                type="number"
                className={styles.input}
                defaultValue={0}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-image">
                Image
              </label>
              <input id="new-image" name="image" type="file" accept="image/*" className={styles.file} required />
            </div>
            <div>
              <button type="submit" disabled={creating} className={`${styles.btn} ${styles.btnGold}`}>
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
          <AdminUploadProgress state={createUpload} style={{ marginTop: "0.75rem" }} />
        </form>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((m) => {
              const id = String(m.id);
              return (
                <tr key={id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      {m.image_url ? (
                        <Image
                          src={String(m.image_url)}
                          alt=""
                          width={56}
                          height={72}
                          className={styles.thumb}
                          unoptimized
                        />
                      ) : null}
                      <div style={{ fontSize: "0.8rem", color: "#a09888" }}>
                        <strong style={{ color: "#f5f0e8" }}>{String(m.name)}</strong>
                        <br />
                        {String(m.category)} · order {String(m.sort_order ?? 0)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <RowUpdateForm m={m} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      disabled={deletingId === id}
                      onClick={async () => {
                        if (deletingId) return;
                        setDeletingId(id);
                        setDeleteError(null);
                        try {
                          const res = await fetch(`/api/admin/roster/${encodeURIComponent(id)}`, {
                            method: "DELETE",
                          });
                          if (!res.ok) {
                            const t = await res.text();
                            throw new Error(parseAdminUploadError(t));
                          }
                          router.refresh();
                        } catch (err) {
                          setDeleteError(err instanceof Error ? err.message : "Remove failed");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {deletingId === id ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {roster.length === 0 ? (
        <p className={styles.adminSubtitle}>No talent profiles yet. Add one above.</p>
      ) : null}
    </main>
  );
}
