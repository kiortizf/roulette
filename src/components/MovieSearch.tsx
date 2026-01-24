'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check } from 'lucide-react';

import { tmdbApi, getPosterUrl } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import GenreFilter from './GenreFilter';
import { GenreId } from '@/lib/genres';


interface MovieSearchProps {
  onAddMovie: (movie: Movie) => void;
  selectedMovies: Movie[];
  maxSelections?: number;
}

export default function MovieSearch({ onAddMovie, selectedMovies, maxSelections = 5 }: MovieSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<GenreId[]>([]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => tmdbApi.searchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  // If genres are selected, use discover API instead of trending
  const { data: trendingData } = useQuery({
    queryKey: ['trending', selectedGenres],
    queryFn: () => selectedGenres.length > 0 
      ? tmdbApi.discoverMovies({ with_genres: selectedGenres.join(',') })
      : tmdbApi.getTrending('week'),
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const isMovieSelected = (movieId: number) => {
    return selectedMovies.some(m => m.id === movieId);
  };

  const canAddMore = selectedMovies.length < maxSelections;

  const moviesToDisplay = debouncedQuery.length > 2 
    ? searchResults?.results || [] 
    : trendingData?.results || [];

  return (
    <div className="w-full">
      {/* Search Input */}
      <GenreFilter
        selectedGenres={selectedGenres}
        onToggleGenre={(genreId) => {

          haptic.light();
          setSelectedGenres(prev =>
            prev.includes(genreId)
              ? prev.filter(id => id !== genreId)
              : [...prev, genreId]
          );
        }}
        onClear={() => {

          setSelectedGenres([]);
        }}
      />

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for movies..."
          className="w-full bg-black/30 border border-gray-600 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDebouncedQuery('');
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-300">
          {debouncedQuery ? 'Search Results' : 'Trending This Week'}
        </h3>
        <span className="text-sm text-gray-400">
          {selectedMovies.length}/{maxSelections} selected
        </span>
      </div>

      {/* Movie Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
            ))
          ) : (
            moviesToDisplay.map((movie) => {
              const selected = isMovieSelected(movie.id);
              return (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    if (selected) return;
                    if (canAddMore) {
                      onAddMovie(movie);
                    }
                  }}
                >
                  <div className={`relative aspect-[2/3] rounded-lg overflow-hidden ${
                    selected 
                      ? 'ring-4 ring-green-500' 
                      : canAddMore 
                        ? 'hover:ring-2 hover:ring-purple-500' 
                        : 'opacity-50 cursor-not-allowed'
                  } transition-all duration-300`}>
                    {movie.poster_path ? (
                      <Image
                        src={getPosterUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600 text-4xl">🎬</span>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      selected ? 'opacity-100' : ''
                    }`}>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-semibold text-sm line-clamp-2 mb-1">
                          {movie.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 text-xs">
                            ⭐ {movie.vote_average.toFixed(1)}
                          </span>
                          <span className="text-gray-300 text-xs">
                            {new Date(movie.release_date).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Selection Badge */}
                    {selected ? (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : canAddMore ? (
                      <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {moviesToDisplay.length === 0 && debouncedQuery && !isLoading && (
        <div className="text-center py-12 text-gray-400">
          <p>No movies found for "{debouncedQuery}"</p>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
