export function rosterSocialLinkMeta(url: string): {
  iconClass: string;
  label: string;
} {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) {
    return { iconClass: "fab fa-instagram", label: "Instagram" };
  }
  if (lower.includes("tiktok.com")) {
    return { iconClass: "fab fa-tiktok", label: "TikTok" };
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return { iconClass: "fab fa-x-twitter", label: "X" };
  }
  if (lower.includes("facebook.com")) {
    return { iconClass: "fab fa-facebook-f", label: "Facebook" };
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return { iconClass: "fab fa-youtube", label: "YouTube" };
  }
  return { iconClass: "fas fa-external-link-alt", label: "Profile" };
}
