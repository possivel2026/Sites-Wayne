import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { bodyWithinLimit, isSameOrigin } from "@/lib/server/http";
import { acceptCurrentTerms, getUserFromAccessToken, readSessionTokens, refreshSupabaseSession, setSessionCookies } from "@/lib/supabase/auth";

export async function GET() {
  if (!getFeatureStatus("auth").ready) return NextResponse.json({ authenticated: false, enabled: false }, { headers: { "cache-control": "no-store" } });
  const { accessToken, refreshToken } = await readSessionTokens();
  if (accessToken) {
    try { return NextResponse.json({ authenticated: true, enabled: true, user: await getUserFromAccessToken(accessToken) }, { headers: { "cache-control": "no-store" } }); }
    catch { /* tenta renovar abaixo */ }
  }
  if (refreshToken) {
    try {
      const session = await refreshSupabaseSession(refreshToken);
      const response = NextResponse.json({ authenticated: true, enabled: true, user: session.user }, { headers: { "cache-control": "no-store" } });
      setSessionCookies(response, session);
      return response;
    } catch { /* sessão expirada */ }
  }
  return NextResponse.json({ authenticated: false, enabled: true }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!getFeatureStatus("auth").ready) return NextResponse.json({ error: "Login indisponível." }, { status: 503 });
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 20_000)) return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { accessToken?: unknown; refreshToken?: unknown; expiresIn?: unknown; acceptedTerms?: unknown };
  const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
  const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : "";
  const expiresIn = Number(body.expiresIn || 3_600);
  if (!accessToken || !refreshToken || accessToken.length > 8_192 || refreshToken.length > 8_192) return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  try {
    let user = await getUserFromAccessToken(accessToken);
    if (user.user_metadata?.terms_version !== "2026-08-17") {
      if (body.acceptedTerms !== true) return NextResponse.json({ error: "Aceite os Termos e a Política de Privacidade para continuar." }, { status: 400 });
      const updated = await acceptCurrentTerms(accessToken);
      user = updated.user || user;
    }
    const response = NextResponse.json({ authenticated: true, user }, { headers: { "cache-control": "no-store" } });
    setSessionCookies(response, { access_token: accessToken, refresh_token: refreshToken, expires_in: Number.isFinite(expiresIn) ? expiresIn : 3_600 });
    return response;
  } catch { return NextResponse.json({ error: "Sessão inválida." }, { status: 401 }); }
}
