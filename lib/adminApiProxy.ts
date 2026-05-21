import { getAdminAccessToken } from "@/lib/admin-session";

export function backendBase(): string {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("BASE_URL is not set");
  return base;
}

export async function proxyAdminBackend(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getAdminAccessToken();
  return fetch(`${backendBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
