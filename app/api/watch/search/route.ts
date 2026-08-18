import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { clientIp, requestId } from "@/lib/server/http";
import { log } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rate-limit";
import { searchTitles } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("watch").ready) return NextResponse.json({ error: "Nexus Watch ainda não foi ativado.", code: "watch_disabled", requestId: id }, { status: 503 });
  const usage = rateLimit(`watch-search:${clientIp(request)}`, 30, 60_000);
  if (!usage.allowed) return NextResponse.json({ error: "Muitas buscas. Tente novamente em instantes.", requestId: id }, { status: 429, headers: { "retry-after": String(usage.retryAfterSeconds) } });
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2 || query.length > 100) return NextResponse.json({ error: "Digite entre 2 e 100 caracteres.", requestId: id }, { status: 400 });
  try {
    return NextResponse.json({ results: await searchTitles(query), requestId: id }, { headers: { "cache-control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch (error) {
    log("warn", "nexus-watch", "search_failed", { requestId: id, error });
    return NextResponse.json({ error: "O catálogo não respondeu. Tente novamente.", requestId: id }, { status: 502 });
  }
}

