import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { Movie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';

interface SelectedMoviesProps {
  movies: Movie[];
  onRemove: (movieId: number) => void;
  userName: string;
  userColor: string;
  minSelections?: number;
  maxSelections?: number;
}

export default function SelectedMovies({ 
  movies, 
  onRemove, 
  userName, 
  userColor,
  minSelections = 2,
  maxSelections = 5 
}: SelectedMoviesProps) {
  const isValid = movies.length >= minSelections && movies.length <= maxSelections;

  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: userColor }}
          />
          {userName}'s Picks
        </h3>
        <span className={`text-sm font-medium ${
          isValid ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {movies.length}/{minSelections}-{maxSelections}
        </span>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No movies selected yet</p>
          <p className="text-sm">Search and add {minSelections}-{maxSelections} movies to continue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 bg-black/30 rounded-lg p-3 group hover:bg-black/50 transition-colors"
            >
              <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={getPosterUrl(movie.poster_path, 'w185')}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs">
                    🎬
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{movie.title}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <span className="text-yellow-400">⭐ {movie.vote_average.toFixed(1)}</span>
                </div>
              </div>

              <button
                onClick={() => onRemove(movie.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!isValid && movies.length > 0 && (
        <div className="mt-4 text-sm text-yellow-400 bg-yellow-400/10 rounded-lg p-3">
          {movies.length < minSelections 
            ? `Add at least ${minSelections - movies.length} more movie${minSelections - movies.length > 1 ? 's' : ''}`
            : `Remove ${movies.length - maxSelections} movie${movies.length - maxSelections > 1 ? 's' : ''}`
          }
        </div>
      )}
    </div>
  );
}
