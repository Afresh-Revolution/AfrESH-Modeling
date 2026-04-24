export type AdminUploadState =
  | { kind: "idle" }
  | { kind: "uploading"; percent: number }
  | { kind: "error"; message: string };

export function parseAdminUploadError(text: string): string {
  try {
    const j = JSON.parse(text) as {
      error?: string | { message?: string };
      message?: string;
    };
    if (typeof j.error === "string" && j.error.trim()) return j.error;
    if (typeof j.error === "object" && typeof j.error?.message === "string" && j.error.message.trim()) {
      return j.error.message;
    }
    if (typeof j.message === "string" && j.message.trim()) return j.message;
    return text || "Upload failed";
  } catch {
    return text || "Upload failed";
  }
}

/** Multipart POST/PATCH with upload progress (same-origin admin API routes). */
export function xhrMultipartWithProgress(opts: {
  method: "POST" | "PATCH";
  url: string;
  formData: FormData;
  onProgress: (percent: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.max(0, Math.min(100, Math.round((e.loaded / e.total) * 100)));
      opts.onProgress(p);
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      reject(new Error(parseAdminUploadError(xhr.responseText)));
    };

    xhr.send(opts.formData);
  });
}
