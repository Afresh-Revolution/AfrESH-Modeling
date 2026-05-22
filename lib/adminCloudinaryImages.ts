import { parseAdminUploadError } from "@/lib/adminMultipartUpload";

type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resource_type: "image" | "video" | "raw";
};

function xhrCloudinaryUpload(opts: {
  file: File;
  sig: CloudinarySignature;
}): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      opts.sig.cloudName,
    )}/${encodeURIComponent(opts.sig.resource_type)}/upload`;

    const fd = new FormData();
    fd.set("file", opts.file);
    fd.set("folder", opts.sig.folder);
    fd.set("api_key", opts.sig.apiKey);
    fd.set("timestamp", String(opts.sig.timestamp));
    fd.set("signature", opts.sig.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
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

/** Upload new image files from a form to Cloudinary and merge with kept URLs from `image_urls` field. */
export async function mergeCloudinaryImagesFromForm(
  fd: FormData,
  fetchSignature: () => Promise<CloudinarySignature>,
): Promise<string[]> {
  let kept: string[] = [];
  const raw = fd.get("image_urls");
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        kept = parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
      }
    } catch {
      kept = [];
    }
  }

  const newFiles: File[] = [];
  for (const [key, value] of fd.entries()) {
    if ((key === "image" || key === "images") && value instanceof File && value.size > 0) {
      newFiles.push(value);
    }
  }

  const sig = await fetchSignature();
  const uploaded: string[] = [];
  for (const file of newFiles) {
    const { secure_url } = await xhrCloudinaryUpload({ file, sig });
    uploaded.push(secure_url);
  }

  fd.delete("image");
  for (const key of [...fd.keys()]) {
    if (key === "images") fd.delete(key);
  }

  const merged = [...kept, ...uploaded];
  fd.set("image_urls", JSON.stringify(merged));
  fd.delete("image_url");
  return merged;
}
