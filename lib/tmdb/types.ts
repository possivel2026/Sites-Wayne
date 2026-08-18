export type WatchMediaType = "movie" | "tv";

export type TmdbTitle = {
  id: number;
  media_type?: WatchMediaType | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
};

export type TmdbListResponse = {
  page: number;
  results: TmdbTitle[];
  total_pages: number;
  total_results: number;
};

export type WatchCard = {
  id: number;
  mediaType: WatchMediaType;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  date: string | null;
  rating: number | null;
};

export type WatchProvider = {
  providerId: number;
  name: string;
  logoUrl: string | null;
};

export type WatchDetails = WatchCard & {
  genres: string[];
  runtimeMinutes: number | null;
  seasons: number | null;
  providers: {
    link: string | null;
    streaming: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
  };
};

