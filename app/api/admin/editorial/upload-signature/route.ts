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
  const unsigned = url.searchParams.get("unsigned") ?? "true";

  const res = await fetch(
    `${backendBase()}/api/admin/editorial/upload-signature?resource_type=${encodeURIComponent(
      resourceType
    )}&unsigned=${encodeURIComponent(unsigned)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
