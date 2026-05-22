import { getPgPool } from "@/lib/db/postgres";
import { FALLBACK_HIRE_MODELS } from "./hire-models-fallback";
import { FALLBACK_EDITORIAL, FALLBACK_ROSTER } from "./roster-fallback";
import {
  DEFAULT_SITE_METRICS,
  parseSiteMetricsRow,
  type SiteMetrics,
} from "./siteMetrics";
import { createSupabaseAnon } from "./supabase";
import { imageUrlsForRow, primaryImageUrl } from "@/lib/imageUrls";
import type { EditorialItem, HireModel, RosterModel } from "./types";

function backendBase(): string | null {
  const base = process.env.BASE_URL?.trim().replace(/\/$/, "");
  return base ? base : null;
}

async function tryFetchFromBackend<T>(path: string): Promise<T | null> {
  const base = backendBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizeRoster(rows: unknown[]): RosterModel[] {
  const out: RosterModel[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const image_urls = imageUrlsForRow({
      image_urls: r.image_urls,
      image_url:
        typeof r.image_url === "string"
          ? r.image_url
          : typeof r.imageUrl === "string"
            ? r.imageUrl
            : null,
    });
    const image = primaryImageUrl(image_urls);
    const name = typeof r.name === "string" ? r.name : "";
    const category = typeof r.category === "string" ? r.category : "";
    if (!name || !category || !image) continue;
    out.push({
      id: typeof r.id === "string" ? r.id : typeof r.id === "number" ? String(r.id) : undefined,
      name,
      category,
      image_url: image,
      image_urls,
      sort_order: typeof r.sort_order === "number" ? r.sort_order : undefined,
    });
  }
  return out;
}

function coerceEditorialRow(row: EditorialItem): EditorialItem {
  return {
    ...row,
    image_url: row.image_url ?? "",
    video_url:
      typeof row.video_url === "string" && row.video_url.trim().length
        ? row.video_url.trim()
        : row.video_url ?? null,
  };
}

function coerceHireModelRow(row: HireModel & { image_urls?: unknown }): HireModel {
  const image_urls = imageUrlsForRow(row);
  const image_url = primaryImageUrl(image_urls, row.image_url) || null;
  return {
    ...row,
    image_url,
    image_urls,
    video_url:
      typeof row.video_url === "string" && row.video_url.trim().length
        ? row.video_url.trim()
        : row.video_url ?? null,
    accomplishments: row.accomplishments ?? "",
  };
}

function normalizeHireModels(rows: unknown[]): HireModel[] {
  const out: HireModel[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name : "";
    const accomplishments =
      typeof r.accomplishments === "string" ? r.accomplishments : "";
    const image_urls = imageUrlsForRow({
      image_urls: r.image_urls,
      image_url:
        typeof r.image_url === "string"
          ? r.image_url
          : typeof r.imageUrl === "string"
            ? r.imageUrl
            : null,
    });
    const image = primaryImageUrl(image_urls);
    const video =
      typeof r.video_url === "string"
        ? r.video_url
        : typeof r.videoUrl === "string"
          ? r.videoUrl
          : null;
    if (!name) continue;
    if (!image && !video) continue;
    out.push({
      id: typeof r.id === "string" ? r.id : typeof r.id === "number" ? String(r.id) : undefined,
      name,
      accomplishments,
      image_url: image || null,
      image_urls,
      video_url: video,
      sort_order: typeof r.sort_order === "number" ? r.sort_order : undefined,
    });
  }
  return out;
}

function normalizeEditorial(rows: unknown[]): EditorialItem[] {
  const out: EditorialItem[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const title = typeof r.title === "string" ? r.title : "";
    const image =
      typeof r.image_url === "string"
        ? r.image_url
        : typeof r.imageUrl === "string"
          ? r.imageUrl
          : "";
    const video =
      typeof r.video_url === "string"
        ? r.video_url
        : typeof r.videoUrl === "string"
          ? r.videoUrl
          : null;
    if (!title) continue;
    if (!image && !video) continue;
    out.push({
      id: typeof r.id === "string" ? r.id : typeof r.id === "number" ? String(r.id) : undefined,
      title,
      image_url: image,
      video_url: video,
      sort_order: typeof r.sort_order === "number" ? r.sort_order : undefined,
    });
  }
  return out;
}

export async function fetchRoster(): Promise<RosterModel[]> {
  // Prefer direct DB reads when configured (same data the API persists; avoids stale/wrong HTTP responses).
  const pool = getPgPool();
  if (pool) {
    try {
      const { rows } = await pool.query<RosterModel & { image_urls?: unknown }>(
        `SELECT id::text, name, category, image_url, image_urls, sort_order
         FROM roster
         ORDER BY sort_order ASC NULLS LAST, name ASC`
      );
      if (rows.length) {
        return rows.map((r) => {
          const image_urls = imageUrlsForRow(r);
          return {
            ...r,
            image_url: primaryImageUrl(image_urls, r.image_url),
            image_urls,
          };
        });
      }
    } catch (e) {
      console.error("[fetchRoster] postgres:", e);
    }
  }

  const supabase = createSupabaseAnon();
  if (supabase) {
    const { data, error } = await supabase
      .from("roster")
      .select("id,name,category,image_url,image_urls,sort_order")
      .order("sort_order", { ascending: true });

    if (!error && data?.length) {
      return (data as (RosterModel & { image_urls?: unknown })[]).map((r) => {
        const image_urls = imageUrlsForRow(r);
        return {
          ...r,
          image_url: primaryImageUrl(image_urls, r.image_url),
          image_urls,
        };
      });
    }
  }

  const backend = await tryFetchFromBackend<{ roster?: unknown[]; data?: unknown[] }>("/api/roster");
  const rosterRows = backend?.roster?.length ? backend.roster : backend?.data;
  if (Array.isArray(rosterRows) && rosterRows.length) {
    const normalized = normalizeRoster(rosterRows);
    if (normalized.length) return normalized;
  }

  return FALLBACK_ROSTER;
}

export async function fetchEditorial(): Promise<EditorialItem[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const { rows } = await pool.query<EditorialItem>(
        `SELECT id::text, title, image_url, video_url, sort_order
         FROM editorial
         ORDER BY sort_order ASC NULLS LAST, title ASC`
      );
      if (rows.length) return rows.map((r) => coerceEditorialRow(r));
    } catch (e) {
      console.error("[fetchEditorial] postgres:", e);
    }
  }

  const supabase = createSupabaseAnon();
  if (supabase) {
    const { data, error } = await supabase
      .from("editorial")
      .select("id,title,image_url,video_url,sort_order")
      .order("sort_order", { ascending: true });

    if (!error && data?.length) {
      return (data as EditorialItem[]).map((r) => coerceEditorialRow(r));
    }
  }

  const backend = await tryFetchFromBackend<{ editorial?: unknown[]; data?: unknown[] }>(
    "/api/editorial"
  );
  const editorialRows = backend?.editorial?.length ? backend.editorial : backend?.data;
  if (Array.isArray(editorialRows) && editorialRows.length) {
    const normalized = normalizeEditorial(editorialRows);
    if (normalized.length) return normalized.map((r) => coerceEditorialRow(r));
  }

  return FALLBACK_EDITORIAL.map((r) => coerceEditorialRow(r));
}

export async function fetchHireModels(): Promise<HireModel[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const { rows } = await pool.query<HireModel & { image_urls?: unknown }>(
        `SELECT id::text, name, image_url, image_urls, video_url, accomplishments, sort_order
         FROM hire_models
         ORDER BY sort_order ASC NULLS LAST, name ASC`
      );
      if (rows.length) return rows.map((r) => coerceHireModelRow(r));
    } catch (e) {
      console.error("[fetchHireModels] postgres:", e);
    }
  }

  const supabase = createSupabaseAnon();
  if (supabase) {
    const { data, error } = await supabase
      .from("hire_models")
      .select("id,name,image_url,image_urls,video_url,accomplishments,sort_order")
      .order("sort_order", { ascending: true });

    if (!error && data?.length) {
      return (data as HireModel[]).map((r) => coerceHireModelRow(r));
    }
  }

  const backend = await tryFetchFromBackend<{ hire_models?: unknown[]; data?: unknown[] }>(
    "/api/hire-models"
  );
  const hireRows = backend?.hire_models?.length ? backend.hire_models : backend?.data;
  if (Array.isArray(hireRows) && hireRows.length) {
    const normalized = normalizeHireModels(hireRows);
    if (normalized.length) return normalized.map((r) => coerceHireModelRow(r));
  }

  return FALLBACK_HIRE_MODELS.map((r) => coerceHireModelRow(r));
}

export async function fetchSiteMetrics(): Promise<SiteMetrics> {
  const pool = getPgPool();
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT total_earnings_display, brand_partnerships, countries_placements,
                models_represented, campaigns_delivered, years_excellence, placement_rate_percent,
                category_distribution, placement_by_year
         FROM site_metrics WHERE id = 1`
      );
      if (rows.length) {
        return parseSiteMetricsRow(rows[0] as Record<string, unknown>);
      }
    } catch (e) {
      console.error("[fetchSiteMetrics] postgres:", e);
    }
  }

  const supabase = createSupabaseAnon();
  if (supabase) {
    const { data, error } = await supabase
      .from("site_metrics")
      .select(
        "total_earnings_display,brand_partnerships,countries_placements,models_represented,campaigns_delivered,years_excellence,placement_rate_percent,category_distribution,placement_by_year"
      )
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      return parseSiteMetricsRow(data as Record<string, unknown>);
    }
  }

  const backend = await tryFetchFromBackend<{ metrics?: Record<string, unknown> }>(
    "/api/metrics"
  );
  if (backend?.metrics && typeof backend.metrics === "object") {
    return parseSiteMetricsRow(backend.metrics);
  }

  return DEFAULT_SITE_METRICS;
}
