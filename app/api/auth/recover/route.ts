import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, clientIp, isSameOrigin, requestId } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { sendRecoveryEmail } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("auth").ready) return apiError("A recuperação ainda não foi ativada.", 503, id, "auth_disabled");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 4_096)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const usage = rateLimit(`auth-recover:${clientIp(request)}`, 3, 60 * 60_000);
  if (!usage.allowed) return apiError("Aguarde antes de solicitar outro e-mail.", 429, id, "rate_limited");
  const body = await request.json().catch(() => ({})) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (/^\S+@\S+\.\S+$/.test(email)) await sendRecoveryEmail(email, `${request.nextUrl.origin}/redefinir-senha`).catch(() => undefined);
  return NextResponse.json({ ok: true, message: "Se a conta existir, enviaremos as instruções por e-mail.", requestId: id });
}

