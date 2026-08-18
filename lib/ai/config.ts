const allowedTools = new Set(["Assistente de texto", "Resumidor", "Plano de negócio", "Descrição de produto", "Organizador de estudos", "Criador de publicações"]);

export function normalizeAITool(value: unknown) {
  const tool = typeof value === "string" ? value.slice(0, 80) : "Assistente de texto";
  return allowedTools.has(tool) ? tool : "Assistente de texto";
}

export function getAIProviderConfig() {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  if (!apiUrl || !apiKey) return null;
  const parsed = new URL(apiUrl);
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !local) throw new Error("ai_provider_url_must_use_https");
  return { apiUrl: parsed.toString(), apiKey, model: process.env.AI_MODEL || undefined };
}
