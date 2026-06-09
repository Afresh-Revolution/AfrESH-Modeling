export type RosterSocialPlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "other";

export type RosterSocialLinkMeta = {
  platform: RosterSocialPlatform;
  iconClass: string;
  label: string;
};

function parseHostname(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

/** Detects platform from a roster profile URL for icon + button label on the public site. */
export function rosterSocialLinkMeta(url: string): RosterSocialLinkMeta {
  const hostname = parseHostname(url);
  const lower = url.trim().toLowerCase();

  if (hostname && hostMatches(hostname, "instagram.com")) {
    return { platform: "instagram", iconClass: "fab fa-instagram", label: "Instagram" };
  }
  if (
    (hostname && hostMatches(hostname, "tiktok.com")) ||
    lower.includes("tiktok.com")
  ) {
    return { platform: "tiktok", iconClass: "fab fa-tiktok", label: "TikTok" };
  }
  if (
    (hostname && (hostMatches(hostname, "twitter.com") || hostMatches(hostname, "x.com"))) ||
    lower.includes("twitter.com") ||
    lower.includes("x.com")
  ) {
    return { platform: "x", iconClass: "fab fa-x-twitter", label: "X" };
  }
  if (hostname && hostMatches(hostname, "facebook.com")) {
    return { platform: "facebook", iconClass: "fab fa-facebook-f", label: "Facebook" };
  }
  if (
    (hostname &&
      (hostMatches(hostname, "youtube.com") || hostMatches(hostname, "youtu.be"))) ||
    lower.includes("youtube.com") ||
    lower.includes("youtu.be")
  ) {
    return { platform: "youtube", iconClass: "fab fa-youtube", label: "YouTube" };
  }
  if (hostname && hostMatches(hostname, "linkedin.com")) {
    return { platform: "linkedin", iconClass: "fab fa-linkedin-in", label: "LinkedIn" };
  }

  return { platform: "other", iconClass: "fas fa-external-link-alt", label: "Profile" };
}
