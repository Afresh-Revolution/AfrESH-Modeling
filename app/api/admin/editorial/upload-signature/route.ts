import { NextResponse } from "next/server";
import { getAdminAccessToken } from "@/lib/admin-session";

function backendBase() {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("BASE_URL is not set");
  return base;
}

export async function GET(req: Request) {
  const token = await getAdminAccessToken();
  const url = new URL(req.url);
  const resourceType = url.searchParams.get("resource_type") ?? "video";
  const qs = new URLSearchParams({ resource_type: resourceType });

  const res = await fetch(
    `${backendBase()}/api/admin/editorial/upload-signature?${qs.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const body = await res.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid upload signature response" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(parsed, { status: res.status });
  }

  // Force signed response shape for frontend consumption.
  const cloudName = String(parsed.cloudName ?? parsed.cloud_name ?? "");
  const apiKey = String(parsed.apiKey ?? parsed.api_key ?? "");
  const folder = String(parsed.folder ?? "");
  const signature = String(parsed.signature ?? "");
  const timestamp =
    typeof parsed.timestamp === "number"
      ? parsed.timestamp
      : Number(parsed.timestamp ?? Number.NaN);

  if (!cloudName || !apiKey || !folder || !signature || !Number.isFinite(timestamp)) {
    return NextResponse.json(
      { error: "Invalid signed Cloudinary response for video upload" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      cloudName,
      apiKey,
      folder,
      resource_type: resourceType,
      timestamp,
      signature,
    },
    { status: res.status }
  );
}
