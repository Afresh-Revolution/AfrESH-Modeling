import { NextResponse } from "next/server";

/**
 * Digital Asset Links for Android TWA / WebAPK verification.
 * Set ANDROID_PACKAGE_ID and ANDROID_SHA256_FINGERPRINTS (comma-separated) after
 * generating a release keystore: `keytool -list -v -keystore android.keystore`
 */
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_ID?.trim() || "com.afreshmodeling.app";
  const raw = process.env.ANDROID_SHA256_FINGERPRINTS?.trim();
  const fingerprints = raw
    ? raw.split(",").map((f) => f.trim().replace(/:/g, "").toUpperCase())
    : [];

  if (fingerprints.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]);
}
