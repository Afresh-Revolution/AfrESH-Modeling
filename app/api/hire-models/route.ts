import { fetchHireModels } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hire_models = await fetchHireModels();
    return NextResponse.json({ hire_models });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load hiring profiles." },
      { status: 500 }
    );
  }
}
