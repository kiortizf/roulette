export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  homepage: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
}

export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProviderResponse {
  id: number;
  results: {
    [country: string]: {
      link: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface RoomStats {
  totalSpins: number;
  moviesWatched: number;
  userWins: { [odUserId: string]: number };  // How many times each user's pick won
  genreCounts: { [genreId: number]: number };  // Most watched genres
  currentStreak: {
    odUserId: string;
    userName: string;
    count: number;
  } | null;
}
