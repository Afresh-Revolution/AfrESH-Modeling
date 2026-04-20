"use server";

import {
  getAdminAccessToken,
  verifyAdminSession,
} from "@/lib/admin-session";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminLoginState = { error?: string } | { ok: true };

function backendBase() {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("BASE_URL is not set");
  return base;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAdminAccessToken();
  return { Authorization: `Bearer ${token}` };
}

async function adminFetch(path: string, init?: RequestInit) {
  await verifyAdminSession();
  const headers = await authHeaders();
  return fetch(`${backendBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...init?.headers,
      ...headers,
    },
  });
}

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let base: string;
  try {
    base = backendBase();
  } catch {
    return { error: "Sign-in is not available right now. Please try again later." };
  }

  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
  };

  if (!res.ok || !data.token) {
    return { error: data.error ?? "Invalid email or password" };
  }

  (await cookies()).set("onyxx_admin", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return { ok: true };
}

export async function adminLogoutAction() {
  (await cookies()).delete({ name: "onyxx_admin", path: "/" });
  redirect("/admin/login");
}

export async function fetchApplicationsJson() {
  const res = await adminFetch("/api/admin/applications");
  if (!res.ok) throw new Error("We couldn't load submissions. Refresh the page and try again.");
  return res.json() as Promise<{
    applications: Record<string, unknown>[];
  }>;
}

export async function fetchRosterJson() {
  const res = await adminFetch("/api/admin/roster");
  if (!res.ok) throw new Error("We couldn't load the roster. Refresh the page and try again.");
  return res.json() as Promise<{
    roster: Record<string, unknown>[];
  }>;
}

export async function fetchEditorialJson() {
  const res = await adminFetch("/api/admin/editorial");
  if (!res.ok) throw new Error("We couldn't load campaigns. Refresh the page and try again.");
  return res.json() as Promise<{
    editorial: Record<string, unknown>[];
  }>;
}

export async function createRosterEntry(formData: FormData) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/roster`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Could not add this profile. Please try again.");
  }
  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function updateRosterEntry(id: string, formData: FormData) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/roster/${id}`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Could not save your changes. Please try again.");
  }
  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function deleteRosterEntry(id: string) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/roster/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Could not remove this profile. Please try again.");
  revalidatePath("/admin/roster");
  revalidatePath("/");
}

export async function createEditorialEntry(formData: FormData) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/editorial`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Could not add this campaign. Please try again.");
  }
  revalidatePath("/admin/editorial");
  revalidatePath("/");
}

export async function updateEditorialEntry(id: string, formData: FormData) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/editorial/${id}`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Could not save your changes. Please try again.");
  }
  revalidatePath("/admin/editorial");
  revalidatePath("/");
}

export async function deleteEditorialEntry(id: string) {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(`${backendBase()}/api/admin/editorial/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Could not remove this campaign. Please try again.");
  revalidatePath("/admin/editorial");
  revalidatePath("/");
}

export type SetApplicationStatusResult =
  | { ok: true; emailError?: string }
  | { ok: false; error: string };

export async function setApplicationStatus(
  id: string,
  status: string,
  interviewAt?: string | null
): Promise<SetApplicationStatusResult> {
  await verifyAdminSession();
  const headers = await authHeaders();
  const body: Record<string, unknown> = { status };
  if (interviewAt) body.interview_at = interviewAt;
  const res = await fetch(
    `${backendBase()}/api/admin/applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    emailError?: string;
  };
  if (!res.ok) {
    return { ok: false, error: data.error ?? "Could not update the status. Please try again." };
  }
  revalidatePath("/admin/applications");
  return { ok: true, emailError: data.emailError };
}

export type UpdateInterviewResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateApplicationInterview(
  id: string,
  interviewAtIso: string
): Promise<UpdateInterviewResult> {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(
    `${backendBase()}/api/admin/applications/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interview_at: interviewAtIso }),
    }
  );
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return { ok: false, error: data.error ?? "Could not update the interview time." };
  }
  revalidatePath("/admin/applications");
  return { ok: true };
}
