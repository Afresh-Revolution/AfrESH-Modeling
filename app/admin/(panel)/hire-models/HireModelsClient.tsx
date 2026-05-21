"use client";

import { AdminUploadProgress } from "@/app/admin/AdminUploadProgress";
import {
  type AdminUploadState,
  parseAdminUploadError,
  xhrMultipartWithProgress,
} from "@/lib/adminMultipartUpload";
import { emitContentUpdate } from "@/lib/contentSync";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "../../admin.module.scss";

type HireModelItem = {
  id: string;
  name: string;
  accomplishments?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  sort_order?: number | null;
};

type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resource_type: "image" | "video" | "raw";
};

type CloudinarySignatureResponse = Partial<CloudinarySignature> & {
  error?: string;
  cloud_name?: string;
  api_key?: string;
  resourceType?: "image" | "video" | "raw";
};

function isNonEmptyString(v: FormDataEntryValue | null): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function getNonEmptyFile(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  if (!(v instanceof File)) return null;
  if (v.size <= 0) return null;
  return v;
}

function deleteEmptyFileField(fd: FormData, key: string) {
  const v = fd.get(key);
  if (v instanceof File && v.size <= 0) fd.delete(key);
}

async function fetchCloudinarySignature(
  resource_type: "image" | "video" | "raw"
): Promise<CloudinarySignature> {
  const q = new URLSearchParams({ resource_type });
  const res = await fetch(`/api/admin/hire-models/upload-signature?${q.toString()}`, {
    cache: "no-store",
  });
  const raw = (await res.json().catch(() => ({}))) as CloudinarySignatureResponse;
  if (!res.ok) throw new Error(raw.error ?? "Could not get upload signature");

  const normalized: CloudinarySignature = {
    cloudName: raw.cloudName ?? raw.cloud_name ?? "",
    apiKey: raw.apiKey ?? raw.api_key ?? "",
    timestamp:
      typeof raw.timestamp === "number"
        ? raw.timestamp
        : Number(raw.timestamp ?? Number.NaN),
    signature: String(raw.signature ?? ""),
    folder: raw.folder ?? "",
    resource_type: raw.resource_type ?? raw.resourceType ?? resource_type,
  };

  if (
    !normalized.cloudName ||
    !normalized.apiKey ||
    !normalized.signature ||
    !Number.isFinite(normalized.timestamp) ||
    !normalized.folder ||
    !normalized.resource_type
  ) {
    throw new Error("Invalid Cloudinary auth response");
  }
  return normalized as CloudinarySignature;
}

function xhrCloudinaryUpload(opts: {
  file: File;
  sig: CloudinarySignature;
  onProgress: (percent: number) => void;
}): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      opts.sig.cloudName
    )}/${encodeURIComponent(opts.sig.resource_type)}/upload`;

    const fd = new FormData();
    fd.set("file", opts.file);
    fd.set("folder", opts.sig.folder);
    fd.set("api_key", opts.sig.apiKey);
    fd.set("timestamp", String(opts.sig.timestamp));
    fd.set("signature", opts.sig.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.max(0, Math.min(100, Math.round((e.loaded / e.total) * 100)));
      opts.onProgress(p);
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(new Error(parseAdminUploadError(xhr.responseText)));
      }
      try {
        const j = JSON.parse(xhr.responseText) as { secure_url?: string };
        if (!j.secure_url) throw new Error("Cloudinary did not return secure_url");
        resolve({ secure_url: j.secure_url });
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Upload failed"));
      }
    };

    xhr.send(fd);
  });
}

function RowEditor({ item }: { item: HireModelItem }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState<AdminUploadState>({ kind: "idle" });

  const id = String(item.id);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        setUpload({ kind: "uploading", percent: 0 });
        try {
          const form = e.currentTarget as HTMLFormElement | null;
          if (!form) throw new Error("Form not found");
          const fd = new FormData(form);

          // Don't send empty file fields.
          deleteEmptyFileField(fd, "image");
          deleteEmptyFileField(fd, "video");

          const manualVideoUrl = fd.get("video_url");
          if (isNonEmptyString(manualVideoUrl)) {
            fd.set("video_url", manualVideoUrl.trim());
            fd.delete("video");
          } else {
            fd.delete("video_url");
            const maybeVideo = getNonEmptyFile(fd, "video");
            if (maybeVideo) {
            const sig = await fetchCloudinarySignature("video");
            const { secure_url } = await xhrCloudinaryUpload({
              file: maybeVideo,
              sig,
              onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
            });
            fd.delete("video");
            fd.set("video_url", secure_url);
          }
          }

          const manualImageUrl = fd.get("image_url");
          if (isNonEmptyString(manualImageUrl)) {
            fd.set("image_url", manualImageUrl.trim());
            fd.delete("image");
          } else {
            fd.delete("image_url");
            const maybeImage = getNonEmptyFile(fd, "image");
            if (maybeImage) {
              const sig = await fetchCloudinarySignature("image");
              const { secure_url } = await xhrCloudinaryUpload({
                file: maybeImage,
                sig,
                onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
              });
              fd.delete("image");
              fd.set("image_url", secure_url);
            }
          }

          await xhrMultipartWithProgress({
            method: "PATCH",
            url: `/api/admin/hire-models/${encodeURIComponent(id)}`,
            formData: fd,
            onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
          });
          setUpload({ kind: "idle" });
          router.refresh();
          emitContentUpdate("hire-models-update");
          form.reset();
        } catch (err) {
          setUpload({
            kind: "error",
            message: err instanceof Error ? err.message : "Upload failed",
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className={styles.formGrid} style={{ gridTemplateColumns: "1fr", minWidth: "240px" }}>
        <div>
          <label className={styles.label}>Model name</label>
          <input name="name" className={styles.input} defaultValue={String(item.name)} required />
        </div>
        <div>
          <label className={styles.label}>Records / accomplishments</label>
          <textarea
            name="accomplishments"
            className={styles.input}
            rows={4}
            defaultValue={String(item.accomplishments ?? "")}
            placeholder="One highlight per line"
          />
        </div>
        <div>
          <label className={styles.label}>Display order</label>
          <input
            name="sort_order"
            type="number"
            className={styles.input}
            defaultValue={Number(item.sort_order ?? 0)}
          />
        </div>
        <div>
          <label className={styles.label}>New image (optional)</label>
          <input name="image" type="file" accept="image/*" className={styles.file} />
        </div>
        <div>
          <label className={styles.label}>Or image URL (optional)</label>
          <input
            name="image_url"
            className={styles.input}
            placeholder="https://res.cloudinary.com/.../image/upload/..."
            inputMode="url"
          />
        </div>
        <div>
          <label className={styles.label}>New video (optional)</label>
          <input name="video" type="file" accept="video/*" className={styles.file} />
        </div>
        <div>
          <label className={styles.label}>Or video URL (optional)</label>
          <input
            name="video_url"
            className={styles.input}
            placeholder="https://res.cloudinary.com/.../video/upload/..."
            inputMode="url"
          />
        </div>

        {item.video_url ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              color: "#aaa",
            }}
          >
            <input type="checkbox" name="clear_video" value="1" />
            Remove video
          </label>
        ) : null}

        <AdminUploadProgress state={upload} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className={`${styles.btn} ${styles.btnGold}`}
        style={{ marginTop: "0.5rem" }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export default function HireModelsClient({
  initialHireModels,
  setupHint,
}: {
  initialHireModels: HireModelItem[];
  setupHint?: string | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [upload, setUpload] = useState<AdminUploadState>({ kind: "idle" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hireModels = useMemo(() => initialHireModels ?? [], [initialHireModels]);

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Hiring models</h1>
      <p className={styles.adminSubtitle}>
        Profiles shown in the public Hiring Models section. Include a photo or video plus career
        highlights (one accomplishment per line).
      </p>

      {setupHint ? (
        <p className={styles.inlineError} style={{ marginBottom: "1rem" }}>
          {setupHint}
        </p>
      ) : null}

      <div className={styles.card}>
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem" }}>
          Add hire profile
        </h2>

        <form
          style={{ marginTop: "1rem" }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (creating) return;

            const form = e.currentTarget as HTMLFormElement | null;
            if (!form) {
              setUpload({ kind: "error", message: "Form not found" });
              return;
            }

            const fd = new FormData(form);
            // Don't send empty file fields.
            deleteEmptyFileField(fd, "image");
            deleteEmptyFileField(fd, "video");

            const hasImageFile = !!getNonEmptyFile(fd, "image");
            const hasVideoFile = !!getNonEmptyFile(fd, "video");
            const hasVideoUrl = isNonEmptyString(fd.get("video_url"));
            const hasImageUrl = isNonEmptyString(fd.get("image_url"));

            if (!hasImageFile && !hasVideoFile && !hasVideoUrl && !hasImageUrl) {
              setUpload({ kind: "error", message: "Please choose an image or a video." });
              return;
            }

            setCreating(true);
            setUpload({ kind: "uploading", percent: 0 });
            try {
              const manualVideoUrl = fd.get("video_url");
              if (isNonEmptyString(manualVideoUrl)) {
                fd.set("video_url", manualVideoUrl.trim());
                fd.delete("video");
              } else {
                fd.delete("video_url");
                const maybeVideo = getNonEmptyFile(fd, "video");
                if (maybeVideo) {
                const sig = await fetchCloudinarySignature("video");
                const { secure_url } = await xhrCloudinaryUpload({
                  file: maybeVideo,
                  sig,
                  onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
                });
                fd.delete("video");
                fd.set("video_url", secure_url);
              }
              }

              const manualImageUrl = fd.get("image_url");
              if (isNonEmptyString(manualImageUrl)) {
                fd.set("image_url", manualImageUrl.trim());
                fd.delete("image");
              } else {
                fd.delete("image_url");
                const maybeImage = getNonEmptyFile(fd, "image");
                if (maybeImage) {
                  const sig = await fetchCloudinarySignature("image");
                  const { secure_url } = await xhrCloudinaryUpload({
                    file: maybeImage,
                    sig,
                    onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
                  });
                  fd.delete("image");
                  fd.set("image_url", secure_url);
                }
              }

              await xhrMultipartWithProgress({
                method: "POST",
                url: "/api/admin/hire-models",
                formData: fd,
                onProgress: (p) => setUpload({ kind: "uploading", percent: p }),
              });
              setUpload({ kind: "idle" });
              router.refresh();
              emitContentUpdate("hire-models-create");
              form.reset();
            } catch (err) {
              setUpload({
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
              <label className={styles.label} htmlFor="hm-name">
                Model name
              </label>
              <input
                id="hm-name"
                name="name"
                className={styles.input}
                required
                placeholder="Amara Okafor"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="hm-accomplishments">
                Records / accomplishments
              </label>
              <textarea
                id="hm-accomplishments"
                name="accomplishments"
                className={styles.input}
                rows={4}
                placeholder="Paris Fashion Week runway&#10;Vogue Italia editorial"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-sort">
                Display order
              </label>
              <input
                id="ed-sort"
                name="sort_order"
                type="number"
                className={styles.input}
                defaultValue={0}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-image">
                Image (optional)
              </label>
              <input
                id="ed-image"
                name="image"
                type="file"
                accept="image/*"
                className={styles.file}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-image-url">
                Or image URL (optional)
              </label>
              <input
                id="ed-image-url"
                name="image_url"
                className={styles.input}
                placeholder="https://res.cloudinary.com/.../image/upload/..."
                inputMode="url"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-video">
                Video (optional)
              </label>
              <input
                id="ed-video"
                name="video"
                type="file"
                accept="video/*"
                className={styles.file}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-video-url">
                Or video URL (optional)
              </label>
              <input
                id="ed-video-url"
                name="video_url"
                className={styles.input}
                placeholder="https://res.cloudinary.com/.../video/upload/..."
                inputMode="url"
              />
            </div>
            <div>
              <button type="submit" disabled={creating} className={`${styles.btn} ${styles.btnGold}`}>
                {creating ? "Uploading…" : "Create"}
              </button>
            </div>
          </div>

          <AdminUploadProgress state={upload} style={{ marginTop: "0.75rem" }} />
        </form>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {hireModels.map((item) => {
              const id = String(item.id);
              return (
                <tr key={id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {item.image_url ? (
                          <Image
                            src={String(item.image_url)}
                            alt=""
                            width={80}
                            height={56}
                            className={styles.thumb}
                            style={{ width: 80, height: 56 }}
                            unoptimized
                          />
                        ) : null}
                        {item.video_url ? (
                          <video
                            src={String(item.video_url)}
                            muted
                            playsInline
                            width={80}
                            height={45}
                            style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }}
                          />
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "#888" }}>No video</span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.85rem" }}>{String(item.name)}</span>
                    </div>
                  </td>
                  <td>
                    <RowEditor item={item} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      disabled={deletingId === id}
                      onClick={async () => {
                        if (deletingId) return;
                        setDeletingId(id);
                        try {
                          const res = await fetch(
                            `/api/admin/hire-models/${encodeURIComponent(id)}`,
                            { method: "DELETE" }
                          );
                          if (!res.ok) {
                            const t = await res.text();
                            throw new Error(parseAdminUploadError(t));
                          }
                          router.refresh();
                          emitContentUpdate("hire-models-delete");
                        } catch (err) {
                          setUpload({
                            kind: "error",
                            message: err instanceof Error ? err.message : "Delete failed",
                          });
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

      {hireModels.length === 0 ? (
        <p className={styles.adminSubtitle}>No hiring profiles yet.</p>
      ) : null}
    </main>
  );
}

