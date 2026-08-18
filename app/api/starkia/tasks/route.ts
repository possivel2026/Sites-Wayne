import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, clientIp, isSameOrigin, requestId } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { insertStarkiaTask, listStarkiaDevices, listStarkiaTasks } from "@/lib/supabase-admin";
import { getUserFromAccessToken, readSessionTokens } from "@/lib/supabase/auth";
import { isUuid } from "@/lib/validation";

async function userSession() {
  const { accessToken } = await readSessionTokens();
  if (!accessToken) return null;
  try { return await getUserFromAccessToken(accessToken); } catch { return null; }
}

export async function GET() {
  if (!getFeatureStatus("starkia").ready) return NextResponse.json({ error: "Integração StarkIA ainda não ativada." }, { status: 503 });
  const user = await userSession();
  if (!user) return NextResponse.json({ error: "Sessão necessária." }, { status: 401 });
  try { return NextResponse.json({ tasks: await listStarkiaTasks(user.id) }, { headers: { "cache-control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível consultar as tarefas." }, { status: 502 }); }
}

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("starkia").ready) return apiError("Integração StarkIA ainda não ativada.", 503, id, "starkia_disabled");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 8_192)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const usage = rateLimit(`starkia-task:${clientIp(request)}`, 20, 60_000);
  if (!usage.allowed) return apiError("Muitas tarefas em pouco tempo.", 429, id, "rate_limited");
  const user = await userSession();
  if (!user) return apiError("Sessão necessária.", 401, id, "auth_required");
  const body = await request.json().catch(() => ({})) as { deviceId?: unknown; persona?: unknown; command?: unknown; message?: unknown };
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
  const persona = body.persona === "ultron" ? "ultron" : "jarvis";
  const command = body.command === "health" || body.command === "list_jobs" || body.command === "assistant_message" ? body.command : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2_000) : "";
  if (!isUuid(deviceId) || !command || command === "assistant_message" && !message) return apiError("Tarefa inválida.", 400, id, "invalid_task");
  try {
    const devices = await listStarkiaDevices(user.id);
    if (!devices.some((device) => device.id === deviceId && device.status !== "revoked")) return apiError("Dispositivo não encontrado.", 404, id, "device_not_found");
    const task = await insertStarkiaTask({ user_id: user.id, device_id: deviceId, persona, command, payload: command === "assistant_message" ? { message } : {} });
    return NextResponse.json({ task, requestId: id }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch { return apiError("Não foi possível criar a tarefa.", 502, id, "task_failed"); }
}
