import { getPgPool } from "@/lib/db/postgres";
import { imageUrlsForRow, parseImageUrls, toDbImageFields } from "@/lib/imageUrls";
import { ensureRosterSocialUrlColumn, rosterReturnColumns } from "@/lib/rosterDb";
import { v2 as cloudinary } from "cloudinary";

const ROSTER_FOLDER = `${process.env.CLOUDINARY_UPLOAD_FOLDER ?? "afresh"}/roster`;

export type RosterAdminRow = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  image_urls: string[];
  social_url?: string | null;
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

export function rosterStorageReady(): boolean {
  return !!getPgPool();
}

function poolOrThrow() {
  const pool = getPgPool();
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not set in .env — add your Postgres connection string to manage roster profiles."
    );
  }
  return pool;
}

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSocialUrl(raw: string | undefined): string | null | undefined {
  if (raw === undefined) return undefined;
  let trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (!isHttpUrl(trimmed)) {
    trimmed = trimmed.replace(/^\/\//, "");
    if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed) || trimmed.startsWith("www.")) {
      trimmed = `https://${trimmed}`;
    }
  }
  if (!isHttpUrl(trimmed)) {
    throw new Error("Social link must be a valid URL (e.g. https://instagram.com/username)");
  }
  return trimmed;
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

export async function uploadRosterImageFile(file: File): Promise<string> {
  ensureCloudinary();
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUri = `data:${mime};base64,${buf.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: ROSTER_FOLDER,
    resource_type: "image",
  });
  return res.secure_url;
}

export async function listRosterAdmin(): Promise<RosterAdminRow[]> {
  const pool = poolOrThrow();
  await ensureRosterSocialUrlColumn(pool);
  const { rows } = await pool.query<RosterAdminRow & { image_urls?: unknown }>(
    `SELECT ${rosterReturnColumns}, created_at, updated_at
     FROM roster
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
}

export async function createRosterFromForm(formData: FormData) {
  const fields = parseFormFields(formData);
  const name = String(fields.name ?? "").trim();
  const category = String(fields.category ?? "").trim();
  const sort_order = Number(fields.sort_order ?? 0) || 0;
  const social_url = normalizeSocialUrl(fields.social_url) ?? null;

  if (!name || !category) throw new Error("name and category required");

  let urls: string[] = [];
  if (fields.image_urls) {
    try {
      urls = parseImageUrls(JSON.parse(fields.image_urls));
    } catch {
      urls = [];
    }
  }
  for (const file of getImageFiles(formData)) {
    urls.push(await uploadRosterImageFile(file));
  }
  const { image_url, image_urls } = toDbImageFields(urls);
  if (!image_url) throw new Error("At least one image is required");

  const pool = poolOrThrow();
  await ensureRosterSocialUrlColumn(pool);
  const { rows } = await pool.query<RosterAdminRow>(
    `INSERT INTO roster (name, category, image_url, image_urls, social_url, sort_order)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6)
     RETURNING ${rosterReturnColumns}`,
    [name, category, image_url, JSON.stringify(image_urls), social_url, sort_order]
  );
  const row = rows[0];
  return { ...row, image_urls: imageUrlsForRow(row) };
}

export async function updateRosterFromForm(id: string, formData: FormData) {
  const fields = parseFormFields(formData);
  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    vals.push(String(fields.name).trim());
  }
  if (fields.category !== undefined) {
    sets.push(`category = $${i++}`);
    vals.push(String(fields.category).trim());
  }
  if (fields.sort_order !== undefined) {
    const n = Number(fields.sort_order);
    if (!Number.isNaN(n)) {
      sets.push(`sort_order = $${i++}`);
      vals.push(n);
    }
  }
  if (fields.social_url !== undefined) {
    sets.push(`social_url = $${i++}`);
    vals.push(normalizeSocialUrl(fields.social_url) ?? null);
  }

  const hasImageUpdate =
    fields.image_urls !== undefined ||
    fields.image_url !== undefined ||
    getImageFiles(formData).length > 0;

  const pool = poolOrThrow();
  await ensureRosterSocialUrlColumn(pool);

  if (hasImageUpdate) {
    const existing = await pool.query<{ image_url: string; image_urls: unknown }>(
      `SELECT image_url, image_urls FROM roster WHERE id = $1::uuid`,
      [id]
    );
    if (!existing.rows.length) throw new Error("Not found");

    let urls =
      fields.image_urls !== undefined
        ? parseImageUrls(JSON.parse(fields.image_urls))
        : imageUrlsForRow(existing.rows[0]);

    if (fields.image_url !== undefined) {
      const manual = String(fields.image_url).trim();
      if (manual && isHttpUrl(manual)) urls = [manual];
      else if (!manual) urls = [];
    }

    for (const file of getImageFiles(formData)) {
      urls.push(await uploadRosterImageFile(file));
    }

    const { image_url, image_urls } = toDbImageFields(urls);
    if (!image_url) throw new Error("At least one image is required");

    sets.push(`image_url = $${i++}`);
    vals.push(image_url);
    sets.push(`image_urls = $${i++}::jsonb`);
    vals.push(JSON.stringify(image_urls));
  }

  if (!sets.length) throw new Error("No fields to update");

  sets.push("updated_at = now()");
  vals.push(id);

  const { rowCount, rows } = await pool.query<RosterAdminRow>(
    `UPDATE roster SET ${sets.join(", ")} WHERE id = $${vals.length}::uuid
     RETURNING ${rosterReturnColumns}`,
    vals
  );
  if (!rowCount) throw new Error("Not found");
  const row = rows[0];
  return { ...row, image_urls: imageUrlsForRow(row) };
}

export async function deleteRoster(id: string) {
  const pool = poolOrThrow();
  const { rowCount } = await pool.query(`DELETE FROM roster WHERE id = $1::uuid`, [id]);
  if (!rowCount) throw new Error("Not found");
}
