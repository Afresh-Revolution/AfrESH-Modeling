import { getPgPool } from "@/lib/db/postgres";
import {
  DEFAULT_LANDING_CONTENT,
  parseLandingContent,
  type LandingContent,
} from "@/lib/landingContent";

export function landingContentStorageReady(): boolean {
  return !!getPgPool();
}

function poolOrThrow() {
  const pool = getPgPool();
  if (!pool) {
    throw new Error(
      "DATABASE_URL is not set in .env — add your Postgres connection string to manage landing content."
    );
  }
  return pool;
}

function isMissingTableError(e: unknown): boolean {
  return (e as { code?: string })?.code === "42P01";
}

export async function getLandingContentAdmin(): Promise<LandingContent> {
  const pool = poolOrThrow();
  try {
    const { rows } = await pool.query<{ content: unknown }>(
      `SELECT content FROM landing_content WHERE id = 1`
    );
    if (rows.length) {
      return parseLandingContent(rows[0].content);
    }
    return DEFAULT_LANDING_CONTENT;
  } catch (e) {
    if (isMissingTableError(e)) {
      throw new Error(
        "The landing_content table is missing. Run afreshmodeling-logic/sql/schema.sql on your database."
      );
    }
    throw e;
  }
}

export async function updateLandingContentAdmin(content: LandingContent): Promise<LandingContent> {
  const pool = poolOrThrow();
  const normalized = parseLandingContent(content);
  try {
    await pool.query(
      `INSERT INTO landing_content (id, content)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE
       SET content = EXCLUDED.content, updated_at = now()`,
      [JSON.stringify(normalized)]
    );
    return normalized;
  } catch (e) {
    if (isMissingTableError(e)) {
      throw new Error(
        "The landing_content table is missing. Run afreshmodeling-logic/sql/schema.sql on your database."
      );
    }
    throw e;
  }
}
