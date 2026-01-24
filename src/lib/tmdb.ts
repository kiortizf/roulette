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
    'with_runtime.gte'?: number;
    'with_runtime.lte'?: number;
    with_watch_providers?: string;
    watch_region?: string;
    with_cast?: string;
    with_crew?: string;
    with_keywords?: string;
    [key: string]: string | number | undefined; // Allow additional TMDB params
  } = {}): Promise<{ results: Movie[]; total_pages?: number; total_results?: number }> => {
    const queryParams: Record<string, string> = {
      sort_by: params.sort_by || 'popularity.desc',
      page: (params.page || 1).toString(),
    };

    // Map all params to query string, converting numbers to strings
    const paramMappings: Array<[string, string | number | undefined]> = [
      ['with_genres', params.with_genres],
      ['without_genres', params.without_genres],
      ['vote_average.gte', params['vote_average.gte']],
      ['vote_average.lte', params['vote_average.lte']],
      ['vote_count.gte', params['vote_count.gte']],
      ['vote_count.lte', params['vote_count.lte']],
      ['primary_release_date.gte', params['primary_release_date.gte']],
      ['primary_release_date.lte', params['primary_release_date.lte']],
      ['with_original_language', params.with_original_language],
      ['without_original_language', params.without_original_language],
      ['with_runtime.gte', params['with_runtime.gte']],
      ['with_runtime.lte', params['with_runtime.lte']],
      ['with_watch_providers', params.with_watch_providers],
      ['watch_region', params.watch_region],
      ['with_cast', params.with_cast],
      ['with_crew', params.with_crew],
      ['with_keywords', params.with_keywords],
    ];

    paramMappings.forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = value.toString();
      }
    });

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
