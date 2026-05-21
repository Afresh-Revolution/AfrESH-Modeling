import { getAdminAccessToken } from "@/lib/admin-session";
import {
  createHireModelFromForm,
  hireModelsStorageReady,
  listHireModelsAdmin,
} from "@/lib/adminHireModels";
import { proxyAdminBackend } from "@/lib/adminApiProxy";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await getAdminAccessToken();

    if (hireModelsStorageReady()) {
      const hire_models = await listHireModelsAdmin();
      return NextResponse.json({ hire_models });
    }

    const res = await proxyAdminBackend("/api/admin/hire-models");
    if (res.ok) {
      return new NextResponse(await res.text(), {
        status: res.status,
        headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
      });
    }

    if (res.status === 404) {
      return NextResponse.json(
        {
          error:
            "Hire-models API is not on your backend yet. Set DATABASE_URL in .env to manage profiles from Next.js, or redeploy onyxx-backend.",
          hire_models: [],
        },
        { status: 503 }
      );
    }

    return new NextResponse(await res.text(), {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Failed to list hire models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminAccessToken();
    const formData = await req.formData();

    if (hireModelsStorageReady()) {
      const item = await createHireModelFromForm(formData);
      revalidatePath("/");
      revalidatePath("/admin/hire-models");
      return NextResponse.json({ item }, { status: 201 });
    }

    const res = await proxyAdminBackend("/api/admin/hire-models", {
      method: "POST",
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
    const message = e instanceof Error ? e.message : "Failed to create hire model";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
