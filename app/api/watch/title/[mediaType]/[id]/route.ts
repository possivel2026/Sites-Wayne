import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { clientIp, requestId } from "@/lib/server/http";
import { log } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rate-limit";
import { getTitleDetails } from "@/lib/tmdb/client";
import type { WatchMediaType } from "@/lib/tmdb/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ mediaType: string; id: string }> }) {
  const requestIdentifier = requestId(request);
  if (!getFeatureStatus("watch").ready) return NextResponse.json({ error: "Nexus Watch ainda não foi ativado.", requestId: requestIdentifier }, { status: 503 });
  const usage = rateLimit(`watch-details:${clientIp(request)}`, 60, 60_000);
  if (!usage.allowed) return NextResponse.json({ error: "Muitas solicitações.", requestId: requestIdentifier }, { status: 429, headers: { "retry-after": String(usage.retryAfterSeconds) } });
  const { mediaType, id } = await params;
  if (mediaType !== "movie" && mediaType !== "tv") return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return NextResponse.json({ error: "Título inválido." }, { status: 400 });
  try {
    const details = await getTitleDetails(mediaType as WatchMediaType, numericId);
    return NextResponse.json({ details, requestId: requestIdentifier }, { headers: { "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  } catch (error) {
    log("warn", "nexus-watch", "details_failed", { requestId: requestIdentifier, error });
    return NextResponse.json({ error: "Não foi possível carregar este título.", requestId: requestIdentifier }, { status: 502 });
  }
}
