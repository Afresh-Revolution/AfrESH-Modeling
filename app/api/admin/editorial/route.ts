import { getAdminAccessToken } from "@/lib/admin-session";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function backendBase() {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("BASE_URL is not set");
  return base;
}

export async function POST(req: Request) {
  const token = await getAdminAccessToken();
  const formData = await req.formData();

  const res = await fetch(`${backendBase()}/api/admin/editorial`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.ok) {
    revalidatePath("/");
    revalidatePath("/admin/editorial");
  }

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

