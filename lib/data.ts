import { getPgPool } from "@/lib/db/postgres";
import { FALLBACK_EDITORIAL, FALLBACK_ROSTER } from "./roster-fallback";
import { createSupabaseAnon } from "./supabase";
import type { EditorialItem, RosterModel } from "./types";

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

export async function fetchRoster(): Promise<RosterModel[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const { rows } = await pool.query<RosterModel>(
        `SELECT id::text, name, category, image_url, sort_order
         FROM roster
         ORDER BY sort_order ASC NULLS LAST, name ASC`
      );
      if (rows.length) return rows;
    } catch (e) {
      console.error("[fetchRoster] postgres:", e);
    }
  }

  const supabase = createSupabaseAnon();
  if (supabase) {
    const { data, error } = await supabase
      .from("roster")
      .select("id,name,category,image_url,sort_order")
      .order("sort_order", { ascending: true });

    if (!error && data?.length) return data as RosterModel[];
  }

  const backend = await tryFetchFromBackend<{ roster?: RosterModel[] }>("/api/roster");
  if (backend?.roster?.length) return backend.roster;

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
      if (rows.length) return rows;
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

    if (!error && data?.length) return data as EditorialItem[];
  }

  const backend = await tryFetchFromBackend<{ editorial?: EditorialItem[] }>("/api/editorial");
  if (backend?.editorial?.length) return backend.editorial;

  return FALLBACK_EDITORIAL;
}
