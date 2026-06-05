const MAX_SEARCH_LENGTH = 200;

/** Strip unsafe characters and HTML from admin search input. */
export function sanitizeSearchQuery(raw: string): string {
  let s = raw
    .replace(/[\0\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

  if (s.length > MAX_SEARCH_LENGTH) {
    s = s.slice(0, MAX_SEARCH_LENGTH);
  }

  return s;
}
