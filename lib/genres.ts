// TMDB Genre mappings
export const MOVIE_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
} as const;

export type GenreId = keyof typeof MOVIE_GENRES;

export const GENRE_LIST = Object.entries(MOVIE_GENRES).map(([id, name]) => ({
  id: Number(id) as GenreId,
  name,
}));

// Popular genre filters for quick access
export const QUICK_FILTERS = [
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 10749, name: 'Romance', emoji: '❤️' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 16, name: 'Animation', emoji: '🎨' },
] as const;
