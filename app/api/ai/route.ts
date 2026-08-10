import { NextRequest, NextResponse } from "next/server";

const windows = new Map<string, { day: string; count: number }>();
const demoResult = (prompt: string) => `Plano Nexus para “${prompt}”\n\n1. Comece pelo resultado mais simples que gera valor real.\n2. Valide com 10 pessoas antes de investir em escala.\n3. Transforme o que funcionar em processo repetível.\n\nPróximo passo: defina uma ação que possa ser concluída ainda hoje.`;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
  const day = new Date().toISOString().slice(0, 10);
  const current = windows.get(ip);
  const count = current?.day === day ? current.count : 0;
  const limit = Number(process.env.AI_FREE_DAILY_LIMIT || 10);
  if (count >= limit) return NextResponse.json({ error: "Limite diário atingido." }, { status: 429 });

  let body: { prompt?: unknown; tool?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const tool = typeof body.tool === "string" ? body.tool.slice(0, 80) : "Assistente de texto";
  if (!prompt || prompt.length > 6000) return NextResponse.json({ error: "O texto deve ter entre 1 e 6.000 caracteres." }, { status: 400 });
  windows.set(ip, { day, count: count + 1 });

  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  if (!apiUrl || !apiKey) return NextResponse.json({ result: demoResult(prompt), mode: "demo", remaining: Math.max(0, limit - count - 1) });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.AI_MODEL, temperature: 0.5, max_tokens: 700, messages: [{ role: "system", content: `Você é a ferramenta ${tool} do Nexus Brasil. Responda em português brasileiro, com clareza, passos práticos e sem promessas irreais.` }, { role: "user", content: prompt }] }),
    });
    if (!response.ok) throw new Error(`provider_${response.status}`);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; output_text?: string; result?: string };
    const result = data.choices?.[0]?.message?.content || data.output_text || data.result;
    if (!result) throw new Error("provider_empty");
    return NextResponse.json({ result, mode: "live", remaining: Math.max(0, limit - count - 1) });
  } catch {
    return NextResponse.json({ error: "O provedor de IA não respondeu. Tente novamente." }, { status: 502 });
  }
}
