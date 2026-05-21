import { getAdminAccessToken } from "@/lib/admin-session";
import {
  deleteHireModel,
  hireModelsStorageReady,
  updateHireModelFromForm,
} from "@/lib/adminHireModels";
import { proxyAdminBackend } from "@/lib/adminApiProxy";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await getAdminAccessToken();
    const { id } = await ctx.params;
    const formData = await req.formData();

    if (hireModelsStorageReady()) {
      const item = await updateHireModelFromForm(id, formData);
      revalidatePath("/");
      revalidatePath("/admin/hire-models");
      return NextResponse.json({ item });
    }

    const res = await proxyAdminBackend(`/api/admin/hire-models/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      revalidatePath("/");
      revalidatePath("/admin/hire-models");
    }

    return new NextResponse(await res.text(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Update failed";
    const status = message === "Not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await getAdminAccessToken();
    const { id } = await ctx.params;

    if (hireModelsStorageReady()) {
      await deleteHireModel(id);
      revalidatePath("/");
      revalidatePath("/admin/hire-models");
      return NextResponse.json({ ok: true });
    }

    const res = await proxyAdminBackend(`/api/admin/hire-models/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      revalidatePath("/");
      revalidatePath("/admin/hire-models");
    }

    return new NextResponse(await res.text() || JSON.stringify({ ok: res.ok }), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Delete failed";
    const status = message === "Not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
