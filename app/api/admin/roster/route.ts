import { getAdminAccessToken } from "@/lib/admin-session";
import { proxyAdminBackend } from "@/lib/adminApiProxy";
import { createRosterFromForm, listRosterAdmin, rosterStorageReady } from "@/lib/adminRoster";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await getAdminAccessToken();

    if (rosterStorageReady()) {
      const roster = await listRosterAdmin();
      return NextResponse.json({ roster });
    }

    const res = await proxyAdminBackend("/api/admin/roster");
    return new NextResponse(await res.text(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Failed to list roster";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminAccessToken();
    const formData = await req.formData();

    if (rosterStorageReady()) {
      const model = await createRosterFromForm(formData);
      revalidatePath("/");
      revalidatePath("/admin/roster");
      return NextResponse.json({ model }, { status: 201 });
    }

    const res = await proxyAdminBackend("/api/admin/roster", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      revalidatePath("/");
      revalidatePath("/admin/roster");
    }

    return new NextResponse(await res.text(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Failed to create roster entry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
