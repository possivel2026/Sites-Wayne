import { NextResponse } from "next/server";
import { clearSessionCookies, readSessionTokens, revokeSupabaseSession } from "@/lib/supabase/auth";

export async function POST() {
  const { accessToken } = await readSessionTokens();
  if (accessToken) await revokeSupabaseSession(accessToken);
  const response = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  clearSessionCookies(response);
  return response;
}

