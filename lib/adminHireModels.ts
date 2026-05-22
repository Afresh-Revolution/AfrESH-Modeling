import { getPgPool } from "@/lib/db/postgres";
import { imageUrlsForRow, parseImageUrls, toDbImageFields } from "@/lib/imageUrls";
import { v2 as cloudinary } from "cloudinary";

const HIRE_FOLDER = `${process.env.CLOUDINARY_UPLOAD_FOLDER ?? "afresh"}/hire-models`;

export type HireModelAdminRow = {
  id: string;
  name: string;
  image_url: string | null;
  image_urls: string[];
  video_url: string | null;
  accomplishments: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

function ensureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary env vars are not set");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

export function hireModelsStorageReady(): boolean {
  return !!getPgPool();
}

function isMissingTableError(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  return code === "42P01";
}

function poolOrThrow() {
  const pool = getPgPool();
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not set in .env — add your Postgres connection string to manage hiring profiles."
    );
  }
  return pool;
}

export async function listHireModelsAdmin(): Promise<HireModelAdminRow[]> {
  const pool = poolOrThrow();
  try {
    const { rows } = await pool.query<HireModelAdminRow & { image_urls?: unknown }>(
      `SELECT id::text, name, image_url, image_urls, video_url, accomplishments, sort_order, created_at, updated_at
       FROM hire_models
       ORDER BY sort_order ASC NULLS LAST, name ASC`
    );
    return rows.map((r) => {
      const image_urls = imageUrlsForRow(r);
      return {
        ...r,
        image_url: image_urls[0] ?? r.image_url,
        image_urls,
      };
    });
  } catch (e) {
    if (isMissingTableError(e)) {
      throw new Error(
        "The hire_models table is missing. Run onyxx-backend/sql/schema.sql (hire_models section) on your database."
      );
    }
    throw e;
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function uploadHireImageFile(file: File): Promise<string> {
  ensureCloudinary();
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUri = `data:${mime};base64,${buf.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: HIRE_FOLDER,
    resource_type: "image",
  });
  return res.secure_url;
}

export function createHireUploadSignature(resourceType: "image" | "video") {
  ensureCloudinary();
  const api_secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder: HIRE_FOLDER, timestamp },
    api_secret
  );
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: HIRE_FOLDER,
    resource_type: resourceType,
    max_file_size: resourceType === "video" ? 500 * 1024 * 1024 : undefined,
  };
}

function parseFormFields(formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

function getImageFiles(formData: FormData): File[] {
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if ((key === "image" || key === "images") && value instanceof File && value.size > 0) {
      files.push(value);
    }
  }
  return files;
}

export async function createHireModelFromForm(formData: FormData) {
  const fields = parseFormFields(formData);
  const name = String(fields.name ?? "").trim();
  const accomplishments = String(fields.accomplishments ?? "").trim();
  const sort_order = Number(fields.sort_order ?? 0) || 0;
  const image_url_body = String(fields.image_url ?? "").trim();
  const video_url_body = String(fields.video_url ?? "").trim();

  if (!name) throw new Error("name required");

  let urls: string[] = [];
  if (fields.image_urls) {
    try {
      urls = parseImageUrls(JSON.parse(fields.image_urls));
    } catch {
      urls = [];
    }
  }
  if (image_url_body && isHttpUrl(image_url_body)) urls.push(image_url_body);
  for (const file of getImageFiles(formData)) {
    urls.push(await uploadHireImageFile(file));
  }
  const { image_url, image_urls } = toDbImageFields(urls);
  const video_url: string | null = video_url_body || null;

  if (video_url && !isHttpUrl(video_url)) throw new Error("Invalid video_url");
  if (!image_url && !video_url) {
    throw new Error("image or video required (or image_url/video_url)");
  }

  const pool = poolOrThrow();
  const { rows } = await pool.query<HireModelAdminRow>(
    `INSERT INTO hire_models (name, image_url, image_urls, video_url, accomplishments, sort_order)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6)
     RETURNING id::text, name, image_url, image_urls, video_url, accomplishments, sort_order`,
    [name, image_url || null, JSON.stringify(image_urls), video_url, accomplishments, sort_order]
  );
  const row = rows[0];
  return { ...row, image_urls: imageUrlsForRow(row) };
}

export async function updateHireModelFromForm(id: string, formData: FormData) {
  const fields = parseFormFields(formData);
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(String(fields.name).trim());
  }
  if (fields.accomplishments !== undefined) {
    sets.push(`accomplishments = $${i++}`);
    vals.push(String(fields.accomplishments).trim());
  }
  if (fields.sort_order !== undefined) {
    const n = Number(fields.sort_order);
    if (!Number.isNaN(n)) {
      sets.push(`sort_order = $${i++}`);
      vals.push(n);
    }
  }

  const image_url_body =
    fields.image_url !== undefined ? String(fields.image_url).trim() : undefined;
  const video_url_body =
    fields.video_url !== undefined ? String(fields.video_url).trim() : undefined;
  const clear_video = fields.clear_video === "1" || fields.clear_video === "true";

  const hasImageUpdate =
    fields.image_urls !== undefined ||
    image_url_body !== undefined ||
    getImageFiles(formData).length > 0;

  if (hasImageUpdate) {
    const existing = await poolOrThrow().query<{ image_url: string | null; image_urls: unknown }>(
      `SELECT image_url, image_urls FROM hire_models WHERE id = $1::uuid`,
      [id]
    );
    if (!existing.rows.length) throw new Error("Not found");

    let urls =
      fields.image_urls !== undefined
        ? parseImageUrls(JSON.parse(fields.image_urls))
        : imageUrlsForRow(existing.rows[0]);

    if (image_url_body !== undefined) {
      if (image_url_body && isHttpUrl(image_url_body)) urls = [image_url_body];
      else urls = [];
    }

    for (const file of getImageFiles(formData)) {
      urls.push(await uploadHireImageFile(file));
    }

    const { image_url, image_urls } = toDbImageFields(urls);
    sets.push(`image_url = $${i++}`);
    vals.push(image_url || null);
    sets.push(`image_urls = $${i++}::jsonb`);
    vals.push(JSON.stringify(image_urls));
  }

  if (clear_video) {
    sets.push(`video_url = $${i++}`);
    vals.push(null);
  } else if (video_url_body !== undefined) {
    if (video_url_body && !isHttpUrl(video_url_body)) throw new Error("Invalid video_url");
    sets.push(`video_url = $${i++}`);
    vals.push(video_url_body || null);
  }

  if (!sets.length) throw new Error("No fields to update");

  sets.push("updated_at = now()");
  vals.push(id);

  const pool = poolOrThrow();
  const { rowCount, rows } = await pool.query<HireModelAdminRow>(
    `UPDATE hire_models SET ${sets.join(", ")} WHERE id = $${i}::uuid
     RETURNING id::text, name, image_url, image_urls, video_url, accomplishments, sort_order`,
    vals
  );
  if (!rowCount) throw new Error("Not found");
  const row = rows[0];
  return { ...row, image_urls: imageUrlsForRow(row) };
}

export async function deleteHireModel(id: string) {
  const pool = poolOrThrow();
  const { rowCount } = await pool.query(`DELETE FROM hire_models WHERE id = $1::uuid`, [id]);
  if (!rowCount) throw new Error("Not found");
}
