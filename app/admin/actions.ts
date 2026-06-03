"use server";

import type { SiteMetrics } from "@/lib/siteMetrics";
import { parseSiteMetricsRow } from "@/lib/siteMetrics";
import {
  DEFAULT_LANDING_CONTENT,
  parseLandingContent,
  type LandingContent,
} from "@/lib/landingContent";
import {
  getAdminAccessToken,
  verifyAdminSession,
} from "@/lib/admin-session";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  readLocalLandingContentMirror,
  writeLocalLandingContentMirror,
} from "@/lib/localLandingContentStore";

export type AdminLoginState = { error?: string } | { ok: true };
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function backendCandidates(): string[] {
  const envCandidates = [
    process.env.BASE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    // Handy local fallbacks for dev when deployed API URL is unreachable.
    process.env.NODE_ENV !== "production" ? "http://127.0.0.1:4000" : undefined,
    process.env.NODE_ENV !== "production" ? "http://localhost:4000" : undefined,
  ]
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().replace(/\/$/, ""));

  return Array.from(new Set(envCandidates));
}

function backendBase() {
  const [first] = backendCandidates();
  if (!first) throw new Error("BASE_URL is not set");
  return first;
}

async function fetchBackendWithFallback(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const candidates = backendCandidates();
  if (!candidates.length) throw new Error("BASE_URL is not set");

  let lastError: unknown = null;
  for (const base of candidates) {
    try {
      const res = await fetch(`${base}${path}`, init);
      return res;
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API is unreachable");
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAdminAccessToken();
  return { Authorization: `Bearer ${token}` };
}

async function adminFetch(path: string, init?: RequestInit) {
  await verifyAdminSession();
  const headers = await authHeaders();
  return fetchBackendWithFallback(path, {
    ...init,
    cache: "no-store",
    headers: {
      ...init?.headers,
      ...headers,
    },
  });
}

async function getClientIp() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.trim();
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const ip = await getClientIp();
  const now = Date.now();
  const existing = loginAttempts.get(ip);
  if (existing && existing.resetAt > now && existing.count >= MAX_LOGIN_ATTEMPTS) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    backendBase();
  } catch {
    return { error: "Sign-in is not available right now. Please try again later." };
  }

  let res: Response;
  try {
    res = await fetchBackendWithFallback("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return {
      error: "We can't sign you in right now. Please try again in a few minutes.",
    };
  }

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
  };

  if (!res.ok || !data.token) {
    const current = loginAttempts.get(ip);
    if (!current || current.resetAt <= now) {
      loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    } else {
      loginAttempts.set(ip, { ...current, count: current.count + 1 });
    }
    return { error: data.error ?? "Invalid email or password" };
  }
  loginAttempts.delete(ip);

  (await cookies()).set("onyxx_admin", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
    priority: "high",
  });

  return { ok: true };
}

export async function adminLogoutAction() {
  (await cookies()).delete({ name: "onyxx_admin", path: "/" });
  redirect("/admin/login");
}

export async function fetchApplicationsJson(): Promise<{
  applications: Record<string, unknown>[];
  loadError: string | null;
}> {
  try {
    const res = await adminFetch("/api/admin/applications");
    if (!res.ok) {
      return {
        applications: [],
        loadError:
          "We couldn't load submissions right now. Please sign out, sign in again, and refresh this page.",
      };
    }
    const data = (await res.json()) as { applications?: Record<string, unknown>[] };
    return { applications: data.applications ?? [], loadError: null };
  } catch {
    return {
      applications: [],
      loadError:
        "We couldn't load submissions right now. Please check that the site API is running, then refresh.",
    };
  }
}

export async function fetchRosterJson() {
  const res = await adminFetch("/api/admin/roster");
  if (!res.ok) throw new Error("We couldn't load the roster. Refresh the page and try again.");
  return res.json() as Promise<{
    roster: Record<string, unknown>[];
  }>;
}

export async function fetchHireModelsJson() {
  await verifyAdminSession();

  const { hireModelsStorageReady, listHireModelsAdmin } = await import(
    "@/lib/adminHireModels"
  );

  if (hireModelsStorageReady()) {
    const hire_models = await listHireModelsAdmin();
    return { hire_models: hire_models as Record<string, unknown>[] };
  }

  const res = await adminFetch("/api/admin/hire-models");
  if (res.ok) {
    return res.json() as Promise<{
      hire_models: Record<string, unknown>[];
    }>;
  }

  if (res.status === 404) {
    return { hire_models: [] };
  }

  const detail = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      detail.error ?? "We couldn't load hiring profiles. Please refresh and try again."
    );
}

export async function fetchEditorialJson() {
  const res = await adminFetch("/api/admin/editorial");
  if (!res.ok) throw new Error("We couldn't load campaigns. Refresh the page and try again.");
  return res.json() as Promise<{
    editorial: Record<string, unknown>[];
  }>;
}

export async function fetchSiteMetricsForAdmin() {
  const res = await adminFetch("/api/admin/site-metrics");
  if (!res.ok) {
    const raw = await res.text();
    let detail = raw.slice(0, 300);
    try {
      const j = JSON.parse(raw) as { error?: string; message?: string };
      detail = (j.error ?? j.message ?? detail).slice(0, 300);
    } catch {
      /* keep truncated body */
    }
    throw new Error(
      detail.trim()
        ? `We couldn't load site metrics. ${detail}`
        : "We couldn't load site metrics. Please refresh and try again."
    );
  }
  return res.json() as Promise<{ metrics: Record<string, unknown> }>;
}

export async function updateSiteMetricsAction(metrics: SiteMetrics): Promise<SiteMetrics> {
  const res = await adminFetch("/api/admin/site-metrics", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrics),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Could not save metrics.");
  }
  const data = (await res.json()) as { metrics?: Record<string, unknown> };
  const saved = parseSiteMetricsRow(data.metrics ?? {});
  revalidatePath("/");
  revalidatePath("/admin/metrics");
  return saved;
}

export async function fetchLandingContentForAdmin(): Promise<{
  landing_content: { content: LandingContent };
  setupHint: string | null;
}> {
  const { landingContentStorageReady, getLandingContentAdmin } = await import(
    "@/lib/adminLandingContent"
  );

  if (landingContentStorageReady()) {
    const content = await getLandingContentAdmin();
    return { landing_content: { content }, setupHint: null };
  }

  const res = await adminFetch("/api/admin/landing-content");
  if (res.ok) {
    const data = (await res.json()) as {
      landing_content?: { content?: Record<string, unknown> };
    };
    const content = parseLandingContent(data.landing_content?.content);
    await writeLocalLandingContentMirror(content);
    return {
      landing_content: { content },
      setupHint: null,
    };
  }

  const localMirror = await readLocalLandingContentMirror();
  if (localMirror) {
    return { landing_content: { content: localMirror }, setupHint: null };
  }

  if (res.status === 404) {
    return {
      landing_content: { content: DEFAULT_LANDING_CONTENT },
      setupHint:
        "Landing content could not be loaded from the server. Saving may not appear on the live site until the connection is restored.",
    };
  }

  const j = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(j.error ?? "Could not load landing content.");
}

export async function updateLandingContentAction(
  content: LandingContent
): Promise<LandingContent> {
  const { landingContentStorageReady, updateLandingContentAdmin } = await import(
    "@/lib/adminLandingContent"
  );

  if (landingContentStorageReady()) {
    const saved = await updateLandingContentAdmin(content);
    await writeLocalLandingContentMirror(saved);
    revalidatePath("/");
    revalidatePath("/admin/landing");
    return saved;
  }

  const res = await adminFetch("/api/admin/landing-content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    const msg = j.error ?? "Could not save landing content.";
    if (res.status === 404) {
      throw new Error(`${msg} Please contact your site administrator.`);
    }
    throw new Error(msg);
  }

  const data = (await res.json()) as {
    landing_content?: { content?: Record<string, unknown> };
  };
  const saved = parseLandingContent(data.landing_content?.content ?? content);
  await writeLocalLandingContentMirror(saved);
  revalidatePath("/");
  revalidatePath("/admin/landing");
  return saved;
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

export type DeleteApplicationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteApplication(
  id: string
): Promise<DeleteApplicationResult> {
  await verifyAdminSession();
  const headers = await authHeaders();
  const res = await fetch(
    `${backendBase()}/api/admin/applications/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return {
      ok: false,
      error: j.error ?? "Could not delete this submission. Please try again.",
    };
  }
  revalidatePath("/admin/applications");
  return { ok: true };
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
