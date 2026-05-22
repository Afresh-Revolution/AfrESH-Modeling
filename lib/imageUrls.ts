/** Normalize image URL list from API/DB (jsonb array, JSON string, or legacy single URL). */
export function parseImageUrls(
  raw: unknown,
  fallback?: string | null
): string[] {
  if (Array.isArray(raw)) {
    const urls = raw
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (urls.length) return urls;
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        return parseImageUrls(JSON.parse(trimmed), fallback);
      } catch {
        /* fall through */
      }
    }
    return [trimmed];
  }
  if (fallback && typeof fallback === "string" && fallback.trim()) {
    return [fallback.trim()];
  }
  return [];
}

export function primaryImageUrl(urls: string[], fallback?: string | null): string {
  return urls[0] ?? (fallback?.trim() ?? "");
}

export function imageUrlsForRow(row: {
  image_urls?: unknown;
  image_url?: string | null;
}): string[] {
  const urls = parseImageUrls(row.image_urls, row.image_url);
  if (urls.length) return urls;
  return parseImageUrls(row.image_url);
}

export function toDbImageFields(urls: string[]): {
  image_url: string;
  image_urls: string[];
} {
  const clean = urls.filter(Boolean);
  return {
    image_url: clean[0] ?? "",
    image_urls: clean,
  };
}
