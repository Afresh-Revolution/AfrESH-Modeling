import { promises as fs } from "node:fs";
import path from "node:path";
import { parseLandingContent, type LandingContent } from "@/lib/landingContent";

const LOCAL_MIRROR_PATH = path.join(
  process.cwd(),
  ".next",
  "cache",
  "landing-content.local.json"
);

export async function readLocalLandingContentMirror(): Promise<LandingContent | null> {
  try {
    const raw = await fs.readFile(LOCAL_MIRROR_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return parseLandingContent(parsed);
  } catch {
    return null;
  }
}

export async function writeLocalLandingContentMirror(content: LandingContent): Promise<void> {
  const normalized = parseLandingContent(content);
  try {
    await fs.mkdir(path.dirname(LOCAL_MIRROR_PATH), { recursive: true });
    await fs.writeFile(LOCAL_MIRROR_PATH, JSON.stringify(normalized), "utf8");
  } catch {
    // best-effort mirror; ignore write failures
  }
}
