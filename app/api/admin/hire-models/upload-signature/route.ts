import { getAdminAccessToken } from "@/lib/admin-session";
import { createHireUploadSignature, hireModelsStorageReady } from "@/lib/adminHireModels";
import { proxyAdminBackend } from "@/lib/adminApiProxy";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await getAdminAccessToken();
    const url = new URL(req.url);
    const resourceType = (url.searchParams.get("resource_type") ?? "video").trim();
    if (resourceType !== "video" && resourceType !== "image") {
      return NextResponse.json({ error: "Invalid resource_type" }, { status: 400 });
    }

    if (hireModelsStorageReady()) {
      return NextResponse.json(createHireUploadSignature(resourceType));
    }

    const qs = new URLSearchParams({ resource_type: resourceType });
    const res = await proxyAdminBackend(
      `/api/admin/hire-models/upload-signature?${qs.toString()}`
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
        { error: "Invalid signed Cloudinary response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      resource_type: resourceType,
      timestamp,
      signature,
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Could not get upload signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
