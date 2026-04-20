import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

function getSessionSecret() {
  const s =
    process.env.JWT_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (!s) throw new Error("JWT_SECRET or ADMIN_SESSION_SECRET is not set");
  return new TextEncoder().encode(s);
}

async function requireAdmin(req: Request): Promise<void> {
  const auth = req.headers.get("authorization");
  const bearer =
    auth && auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const cookieToken = (await cookies()).get("onyxx_admin")?.value ?? "";
  const token = bearer || cookieToken;
  if (!token) throw new Error("Unauthorized");

  const { payload } = await jwtVerify(token, getSessionSecret());
  if (payload.role !== "admin") throw new Error("Unauthorized");
}

function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "onyxx";
  const folder = `${baseFolder.replace(/\/$/, "")}/editorial`;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary env vars are not set" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const resourceType = url.searchParams.get("resource_type") || "video";
  const allowed = new Set(["image", "video", "raw"]);
  const resource_type = allowed.has(resourceType) ? resourceType : "video";

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signed uploads expect a signature over the upload parameters.
  // `resource_type` is implied by the upload endpoint path and should not be signed.
  const signature = cloudinarySignature(
    {
      folder,
      timestamp: String(timestamp),
    },
    apiSecret
  );

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    resource_type,
  });
}

