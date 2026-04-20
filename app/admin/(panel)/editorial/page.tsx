import { fetchEditorialJson } from "../../actions";
import EditorialClient from "./EditorialClient";

type EditorialItem = {
  id: string;
  title: string;
  image_url?: string | null;
  video_url?: string | null;
  sort_order?: number | null;
};

function normalizeEditorial(input: unknown): EditorialItem[] {
  if (!Array.isArray(input)) return [];
  const out: EditorialItem[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = o.id;
    const title = o.title;
    if (
      !(typeof id === "string" || typeof id === "number") ||
      typeof title !== "string"
    ) {
      continue;
    }
    out.push({
      id: String(id),
      title,
      image_url: typeof o.image_url === "string" ? o.image_url : null,
      video_url: typeof o.video_url === "string" ? o.video_url : null,
      sort_order: typeof o.sort_order === "number" ? o.sort_order : null,
    });
  }
  return out;
}

export default async function AdminEditorialPage() {
  const { editorial } = await fetchEditorialJson();
  return <EditorialClient initialEditorial={normalizeEditorial(editorial)} />;
}
