import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, clientIp, isSameOrigin, requestId } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { updatePassword } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("auth").ready) return apiError("Recurso indisponível.", 503, id, "auth_disabled");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 16_384)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const usage = rateLimit(`auth-password:${clientIp(request)}`, 5, 60 * 60_000);
  if (!usage.allowed) return apiError("Muitas tentativas.", 429, id, "rate_limited");
  const body = await request.json().catch(() => ({})) as { accessToken?: unknown; password?: unknown };
  const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!accessToken || accessToken.length > 8_192 || password.length < 8 || password.length > 128) return apiError("Link ou senha inválidos.", 400, id, "invalid_password_reset");
  try { await updatePassword(accessToken, password); return NextResponse.json({ ok: true, requestId: id }); }
  catch { return apiError("O link expirou ou já foi utilizado.", 400, id, "expired_recovery"); }
}

