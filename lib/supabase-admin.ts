import type { WayneSiteOrder } from "@/lib/wayne-autopilot";
import { fetchSafeGet, fetchWithTimeout } from "@/lib/server/http";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_not_configured");
  return { url, key };
}

async function request<T>(path: string, init: RequestInit = {}) {
  const { url, key } = getConfig();
  const initWithHeaders: RequestInit = {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  };
  const target = `${url}/rest/v1/${path}`;
  const response = !init.method || init.method === "GET" ? await fetchSafeGet(target, initWithHeaders) : await fetchWithTimeout(target, initWithHeaders);
  if (!response.ok) throw new Error(`supabase_${response.status}_${await response.text()}`);
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export async function insertWayneOrder(order: Record<string, unknown>) {
  const rows = await request<WayneSiteOrder[]>("wayne_site_orders", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(order),
  });
  return rows[0];
}

export async function updateWayneOrder(id: string, patch: Record<string, unknown>) {
  const rows = await request<WayneSiteOrder[]>(`wayne_site_orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  return rows[0] || null;
}

export async function getWayneOrderById(id: string) {
  const rows = await request<WayneSiteOrder[]>(`wayne_site_orders?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows[0] || null;
}

export async function getPublishedWayneSite(slug: string) {
  const rows = await request<WayneSiteOrder[]>(`wayne_site_orders?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*`);
  return rows[0] || null;
}

export async function listPublishedWayneSites(limit = 100) {
  return request<WayneSiteOrder[]>(`wayne_site_orders?status=eq.published&select=id,slug,site_data,updated_at,last_health_status,last_health_check_at&limit=${limit}`);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
