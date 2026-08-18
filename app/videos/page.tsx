import { WatchPage } from "@/components/watch-page";
import { getFeatureStatus } from "@/lib/server/features";
import { getTrendingTitles } from "@/lib/tmdb/client";
import type { WatchCard } from "@/lib/tmdb/types";

export const revalidate = 1_800;

export default async function VideosPage() {
  if (!getFeatureStatus("watch").ready) return <WatchPage ready={false} initialTitles={[]} />;
  let titles: WatchCard[] = [];
  let initialError: string | undefined;
  try { titles = await getTrendingTitles(); }
  catch { initialError = "O TMDB não respondeu agora. A área continua isolada do restante do Nexus."; }
  return <WatchPage ready initialTitles={titles} initialError={initialError} tmdbLogoUrl={process.env.NEXT_PUBLIC_TMDB_LOGO_URL} />;
}
