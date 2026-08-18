import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, isSameOrigin, requestId } from "@/lib/server/http";
import { createDeviceToken } from "@/lib/starkia/relay";
import { insertStarkiaDevice, listStarkiaDevices, revokeStarkiaDevice } from "@/lib/supabase-admin";
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
  if (!user) return NextResponse.json({ error: "Entre para ver seus dispositivos." }, { status: 401 });
  try { return NextResponse.json({ devices: await listStarkiaDevices(user.id) }, { headers: { "cache-control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível consultar os dispositivos." }, { status: 502 }); }
}

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("starkia").ready) return apiError("Integração StarkIA ainda não ativada.", 503, id, "starkia_disabled");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 4_096)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const user = await userSession();
  if (!user) return apiError("Entre para parear um dispositivo.", 401, id, "auth_required");
  const body = await request.json().catch(() => ({})) as { name?: unknown };
  const name = typeof body.name === "string" ? body.name.trim().replace(/[<>]/g, "").slice(0, 80) : "";
  if (name.length < 2) return apiError("Informe um nome para o dispositivo.", 400, id, "invalid_device_name");
  try {
    const credential = createDeviceToken();
    const device = await insertStarkiaDevice({ user_id: user.id, name, token_hash: credential.hash, token_prefix: credential.prefix });
    return NextResponse.json({ device, token: credential.token, warning: "Copie agora: este token não será exibido novamente.", requestId: id }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch { return apiError("Não foi possível parear o dispositivo.", 502, id, "pairing_failed"); }
}

export async function DELETE(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("starkia").ready) return apiError("Integração indisponível.", 503, id, "starkia_disabled");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 4_096)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const user = await userSession();
  if (!user) return apiError("Sessão necessária.", 401, id, "auth_required");
  const body = await request.json().catch(() => ({})) as { id?: unknown };
  if (!isUuid(body.id)) return apiError("Dispositivo inválido.", 400, id, "invalid_device");
  const device = await revokeStarkiaDevice(body.id, user.id).catch(() => null);
  return device ? NextResponse.json({ ok: true }) : apiError("Dispositivo não encontrado.", 404, id, "device_not_found");
}
