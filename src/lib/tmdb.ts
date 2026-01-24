import { Movie, MovieDetails, WatchProviderResponse, Video, Cast } from './types';

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.warn('TMDB API key is not set. Please add VITE_TMDB_API_KEY to your .env file');
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY || '');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface Keyword {
  id: number;
  name: string;
}

export const tmdbApi = {
  searchMovies: async (query: string, page = 1): Promise<{ results: Movie[]; total_pages: number; total_results: number }> => {
    return fetchTMDB('/search/movie', { query, page: page.toString() });
  },

  searchPerson: async (query: string): Promise<{ results: Person[] }> => {
    return fetchTMDB('/search/person', { query });
  },

  searchKeyword: async (query: string): Promise<{ results: Keyword[] }> => {
    return fetchTMDB('/search/keyword', { query });
  },

  discoverMovies: async (params: {
    with_genres?: string;
    without_genres?: string;
    sort_by?: string;
    page?: number;
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
    'vote_count.gte'?: number;
    'vote_count.lte'?: number;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    with_original_language?: string;
    without_original_language?: string;
    with_runtime?: { min?: number; max?: number };
    with_watch_providers?: string;
    watch_region?: string;
    with_cast?: string;
    with_crew?: string;
    with_keywords?: string;
  } = {}): Promise<{ results: Movie[] }> => {
    const queryParams: Record<string, string> = {
      sort_by: params.sort_by || 'popularity.desc',
      page: (params.page || 1).toString(),
    };

    if (params.with_genres) queryParams.with_genres = params.with_genres;
    if (params.without_genres) queryParams.without_genres = params.without_genres;
    if (params['vote_average.gte']) queryParams['vote_average.gte'] = params['vote_average.gte'].toString();
    if (params['vote_average.lte']) queryParams['vote_average.lte'] = params['vote_average.lte'].toString();
    if (params['vote_count.gte']) queryParams['vote_count.gte'] = params['vote_count.gte'].toString();
    if (params['vote_count.lte']) queryParams['vote_count.lte'] = params['vote_count.lte'].toString();
    if (params['primary_release_date.gte']) queryParams['primary_release_date.gte'] = params['primary_release_date.gte'];
    if (params['primary_release_date.lte']) queryParams['primary_release_date.lte'] = params['primary_release_date.lte'];
    if (params.with_original_language) queryParams.with_original_language = params.with_original_language;
    if (params.without_original_language) queryParams.without_original_language = params.without_original_language;
    if (params.with_runtime?.min) queryParams['with_runtime.gte'] = params.with_runtime.min.toString();
    if (params.with_runtime?.max) queryParams['with_runtime.lte'] = params.with_runtime.max.toString();
    if (params.with_watch_providers) queryParams.with_watch_providers = params.with_watch_providers;
    if (params.watch_region) queryParams.watch_region = params.watch_region;
    if (params.with_cast) queryParams.with_cast = params.with_cast;
    if (params.with_crew) queryParams.with_crew = params.with_crew;
    if (params.with_keywords) queryParams.with_keywords = params.with_keywords;

    return fetchTMDB('/discover/movie', queryParams);
  },

  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    return fetchTMDB(`/movie/${movieId}`);
  },

  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<{ results: Movie[] }> => {
    return fetchTMDB(`/trending/movie/${timeWindow}`);
  },

  getPopular: async (page = 1): Promise<{ results: Movie[] }> => {
    return fetchTMDB('/movie/popular', { page: page.toString() });
  },

  getTopRated: async (page = 1): Promise<{ results: Movie[] }> => {
    return fetchTMDB('/movie/top_rated', { page: page.toString() });
  },

  getUpcoming: async (page = 1): Promise<{ results: Movie[] }> => {
    return fetchTMDB('/movie/upcoming', { page: page.toString() });
  },

  getWatchProviders: async (movieId: number): Promise<WatchProviderResponse> => {
    return fetchTMDB(`/movie/${movieId}/watch/providers`);
  },

  getVideos: async (movieId: number): Promise<{ results: Video[] }> => {
    return fetchTMDB(`/movie/${movieId}/videos`);
  },

  getCredits: async (movieId: number): Promise<{ cast: Cast[] }> => {
    return fetchTMDB(`/movie/${movieId}/credits`);
  },

  getGenres: async (): Promise<{ genres: Array<{ id: number; name: string }> }> => {
    return fetchTMDB('/genre/movie/list');
  },

  discoverByGenre: async (genreId: number, page = 1): Promise<{ results: Movie[] }> => {
    return fetchTMDB('/discover/movie', {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc',
    });
  },
};

export const getPosterUrl = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-poster.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return '/placeholder-backdrop.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getProfileUrl = (path: string | null, size: 'w185' | 'h632' | 'original' = 'w185'): string => {
  if (!path) return '/placeholder-profile.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
