import "server-only";
import { fetchSafeGet } from "@/lib/server/http";
import type { TmdbListResponse, TmdbTitle, WatchCard, WatchDetails, WatchMediaType, WatchProvider } from "@/lib/tmdb/types";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function token() {
  const value = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (!value) throw new Error("tmdb_not_configured");
  return value;
}

async function tmdbGet<T>(path: string, revalidate = 3_600): Promise<T> {
  const response = await fetchSafeGet(`${API_BASE}${path}`, {
    headers: { accept: "application/json", authorization: `Bearer ${token()}` },
    next: { revalidate },
  } as RequestInit, 3);
  if (!response.ok) throw new Error(`tmdb_${response.status}`);
  return await response.json() as T;
}

function image(path: string | null | undefined, size: "w500" | "w780") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

function normalize(item: TmdbTitle, fallbackType?: WatchMediaType): WatchCard | null {
  const mediaType = item.media_type === "movie" || item.media_type === "tv" ? item.media_type : fallbackType;
  if (!mediaType) return null;
  const title = mediaType === "movie" ? item.title : item.name;
  if (!title) return null;
  return {
    id: item.id,
    mediaType,
    title,
    overview: item.overview?.trim() || "Sinopse ainda não disponível em português.",
    posterUrl: image(item.poster_path, "w500"),
    backdropUrl: image(item.backdrop_path, "w780"),
    date: item.release_date || item.first_air_date || null,
    rating: Number.isFinite(item.vote_average) ? Number(item.vote_average) : null,
  };
}

function normalizeList(items: TmdbTitle[], fallbackType?: WatchMediaType) {
  return items.map((item) => normalize(item, fallbackType)).filter((item): item is WatchCard => Boolean(item));
}

export async function getTrendingTitles() {
  const data = await tmdbGet<TmdbListResponse>("/trending/all/day?language=pt-BR", 1_800);
  return normalizeList(data.results).slice(0, 18);
}

export async function searchTitles(query: string) {
  const value = query.trim().slice(0, 100);
  if (value.length < 2) return [];
  const params = new URLSearchParams({ query: value, include_adult: "false", language: "pt-BR", page: "1" });
  const data = await tmdbGet<TmdbListResponse>(`/search/multi?${params}`, 900);
  return normalizeList(data.results).slice(0, 24);
}

type ProviderRegion = {
  link?: string;
  flatrate?: Array<{ provider_id: number; provider_name: string; logo_path?: string | null }>;
  rent?: Array<{ provider_id: number; provider_name: string; logo_path?: string | null }>;
  buy?: Array<{ provider_id: number; provider_name: string; logo_path?: string | null }>;
};

type DetailsResponse = TmdbTitle & {
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  "watch/providers"?: { results?: { BR?: ProviderRegion } };
};

function providers(items: ProviderRegion["flatrate"]): WatchProvider[] {
  return (items || []).map((provider) => ({
    providerId: provider.provider_id,
    name: provider.provider_name,
    logoUrl: image(provider.logo_path, "w500"),
  }));
}

export async function getTitleDetails(mediaType: WatchMediaType, id: number): Promise<WatchDetails> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("invalid_tmdb_id");
  const data = await tmdbGet<DetailsResponse>(`/${mediaType}/${id}?language=pt-BR&append_to_response=watch%2Fproviders`, 21_600);
  const card = normalize({ ...data, media_type: mediaType });
  if (!card) throw new Error("invalid_tmdb_title");
  const brazil = data["watch/providers"]?.results?.BR;
  return {
    ...card,
    genres: (data.genres || []).map((genre) => genre.name),
    runtimeMinutes: mediaType === "movie" ? data.runtime || null : data.episode_run_time?.[0] || null,
    seasons: mediaType === "tv" ? data.number_of_seasons || null : null,
    providers: {
      link: brazil?.link || null,
      streaming: providers(brazil?.flatrate),
      rent: providers(brazil?.rent),
      buy: providers(brazil?.buy),
    },
  };
}

