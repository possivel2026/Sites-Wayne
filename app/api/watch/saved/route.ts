import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, isSameOrigin, requestId } from "@/lib/server/http";
import { getUserFromAccessToken, readSessionTokens } from "@/lib/supabase/auth";
import { supabaseUserRequest } from "@/lib/supabase/rest";
import type { WatchMediaType } from "@/lib/tmdb/types";

type SavedTitle = { user_id: string; media_type: WatchMediaType; tmdb_id: number; title: string; poster_url: string | null; saved_at?: string };

async function session() {
  const { accessToken } = await readSessionTokens();
  if (!accessToken) return null;
  try { return { accessToken, user: await getUserFromAccessToken(accessToken) }; }
  catch { return null; }
}

export async function GET() {
  if (!getFeatureStatus("auth").ready) return NextResponse.json({ saved: [] });
  const current = await session();
  if (!current) return NextResponse.json({ saved: [] });
  const rows = await supabaseUserRequest<SavedTitle[]>(`watch_saves?user_id=eq.${encodeURIComponent(current.user.id)}&select=media_type,tmdb_id,title,poster_url,saved_at&order=saved_at.desc`, current.accessToken).catch(() => []);
  return NextResponse.json({ saved: rows }, { headers: { "cache-control": "no-store" } });
}

async function mutate(request: NextRequest, remove: boolean) {
  const id = requestId(request);
  if (!getFeatureStatus("auth").ready) return apiError("Entre na sua conta para salvar títulos.", 401, id, "auth_required");
  if (!isSameOrigin(request) || !bodyWithinLimit(request, 8_192)) return apiError("Solicitação inválida.", 400, id, "invalid_request");
  const current = await session();
  if (!current) return apiError("Entre na sua conta para salvar títulos.", 401, id, "auth_required");
  const body = await request.json().catch(() => ({})) as { id?: unknown; mediaType?: unknown; title?: unknown; posterUrl?: unknown };
  const tmdbId = Number(body.id);
  const mediaType = body.mediaType === "movie" || body.mediaType === "tv" ? body.mediaType : null;
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const posterUrl = typeof body.posterUrl === "string" && body.posterUrl.startsWith("https://image.tmdb.org/") ? body.posterUrl : null;
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0 || !mediaType || !title) return apiError("Título inválido.", 400, id, "invalid_title");
  try {
    if (remove) await supabaseUserRequest(`watch_saves?user_id=eq.${encodeURIComponent(current.user.id)}&media_type=eq.${mediaType}&tmdb_id=eq.${tmdbId}`, current.accessToken, { method: "DELETE" });
    else await supabaseUserRequest("watch_saves?on_conflict=user_id,media_type,tmdb_id", current.accessToken, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: current.user.id, media_type: mediaType, tmdb_id: tmdbId, title, poster_url: posterUrl }) });
    return NextResponse.json({ ok: true, requestId: id });
  } catch { return apiError("Não foi possível atualizar seus títulos salvos.", 502, id, "save_failed"); }
}

export async function POST(request: NextRequest) { return mutate(request, false); }
export async function DELETE(request: NextRequest) { return mutate(request, true); }

