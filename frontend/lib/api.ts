"use client";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = new Headers(options.headers);
  // Don't force Content-Type on requests like GET/DELETE with no body.
  if (!headers.has("content-type") && options.body != null) {
    headers.set("content-type", "application/json");
  }
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);

  const res = await fetch(url, { ...options, headers });
  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}


