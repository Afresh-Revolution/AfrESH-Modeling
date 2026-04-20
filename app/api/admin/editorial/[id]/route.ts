import { getAdminAccessToken } from "@/lib/admin-session";
import { NextResponse } from "next/server";

function backendBase() {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("BASE_URL is not set");
  return base;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = await getAdminAccessToken();
  const { id } = await ctx.params;
  const formData = await req.formData();

  const res = await fetch(`${backendBase()}/api/admin/editorial/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const token = await getAdminAccessToken();
  const { id } = await ctx.params;

  const res = await fetch(`${backendBase()}/api/admin/editorial/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.text();
  return new NextResponse(body || JSON.stringify({ ok: res.ok }), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

