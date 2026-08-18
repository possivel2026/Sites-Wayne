import { NextRequest, NextResponse } from "next/server";
import { getAIProviderConfig, normalizeAITool } from "@/lib/ai/config";
import { nexusSystemInstruction } from "@/lib/ai/prompts";
import { bodyWithinLimit, clientIp, fetchWithTimeout, isSameOrigin, requestId } from "@/lib/server/http";
import { log } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rate-limit";

const demoResult = (prompt: string) => `Plano Nexus para “${prompt}”\n\n1. Comece pelo resultado mais simples que gera valor real.\n2. Valide com 10 pessoas antes de investir em escala.\n3. Transforme o que funcionar em processo repetível.\n\nPróximo passo: defina uma ação que possa ser concluída ainda hoje.`;

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada.", requestId: id }, { status: 403 });
  if (!bodyWithinLimit(request, 16_384)) return NextResponse.json({ error: "Solicitação muito grande.", requestId: id }, { status: 413 });
  const limit = Number(process.env.AI_FREE_DAILY_LIMIT || 10);
  const usage = rateLimit(`ai:${clientIp(request)}`, Number.isFinite(limit) ? limit : 10, 86_400_000);
  if (!usage.allowed) return NextResponse.json({ error: "Limite diário atingido.", requestId: id }, { status: 429, headers: { "retry-after": String(usage.retryAfterSeconds) } });

  let body: { prompt?: unknown; tool?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const tool = normalizeAITool(body.tool);
  if (!prompt || prompt.length > 6000) return NextResponse.json({ error: "O texto deve ter entre 1 e 6.000 caracteres." }, { status: 400 });

  let provider: ReturnType<typeof getAIProviderConfig>;
  try { provider = getAIProviderConfig(); }
  catch (error) {
    log("error", "nexus-ai", "invalid_provider_config", { requestId: id, error });
    return NextResponse.json({ error: "O provedor de IA está configurado incorretamente.", requestId: id }, { status: 503 });
  }
  if (!provider) return NextResponse.json({ result: demoResult(prompt), mode: "demo", remaining: usage.remaining, requestId: id });

  try {
    const response = await fetchWithTimeout(provider.apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({ model: provider.model, temperature: 0.5, max_tokens: 700, messages: [{ role: "system", content: nexusSystemInstruction(tool) }, { role: "user", content: prompt }] }),
    }, 20_000);
    if (!response.ok) throw new Error(`provider_${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; output_text?: string; result?: string };
    const result = data.choices?.[0]?.message?.content || data.output_text || data.result;
    if (!result) throw new Error("provider_empty");
    return NextResponse.json({ result: result.slice(0, 50_000), mode: "live", remaining: usage.remaining, requestId: id });
  } catch (error) {
    log("warn", "nexus-ai", "provider_unavailable", { requestId: id, error });
    return NextResponse.json({ error: "O provedor de IA não respondeu. Tente novamente.", requestId: id }, { status: 502 });
  }
}
