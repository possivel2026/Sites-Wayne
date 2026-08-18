import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, clientIp, isSameOrigin, requestId } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { setSessionCookies, signInWithPassword } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("auth").ready) return apiError("O login ainda não foi ativado.", 503, id, "auth_disabled");
  if (!isSameOrigin(request)) return apiError("Origem não autorizada.", 403, id, "origin_denied");
  if (!bodyWithinLimit(request, 8_192)) return apiError("Solicitação muito grande.", 413, id, "body_too_large");
  const usage = rateLimit(`auth-login:${clientIp(request)}`, 10, 15 * 60_000);
  if (!usage.allowed) return apiError("Muitas tentativas. Aguarde alguns minutos.", 429, id, "rate_limited");
  const body = await request.json().catch(() => ({})) as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) return apiError("E-mail ou senha inválidos.", 400, id, "invalid_credentials");
  try {
    const session = await signInWithPassword(email, password);
    const response = NextResponse.json({ user: session.user, requestId: id }, { headers: { "cache-control": "no-store" } });
    setSessionCookies(response, session);
    return response;
  } catch {
    return apiError("E-mail ou senha inválidos.", 401, id, "invalid_credentials");
  }
}

