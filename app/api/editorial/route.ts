import { NextResponse } from "next/server";
import { fetchEditorial } from "@/lib/data";

export async function GET() {
  try {
    const editorial = await fetchEditorial();
    return NextResponse.json({ editorial });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not load campaigns." },
      { status: 500 }
    );
  }
}
