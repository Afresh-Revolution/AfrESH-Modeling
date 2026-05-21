import { v2 as cloudinary } from "cloudinary";

function ensureConfigured() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary env vars are not set");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

export async function uploadImageDataUri(
  dataUri: string,
  folder?: string
): Promise<string> {
  ensureConfigured();
  const uploadFolder =
    folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? "afresh/applications";
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: uploadFolder,
    resource_type: "image",
  });
  return res.secure_url;
}
