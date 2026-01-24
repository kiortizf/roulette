import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Movie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';
import { Sparkles } from 'lucide-react';
import { haptic } from '@/lib/sounds';


interface RouletteWheelProps {
  movies: Movie[];
  votes?: { [movieId: number]: number }; // Vote totals per movie
  isSpinning: boolean;
  onSpinComplete: (winner: Movie) => void;
}

// Weighted random selection - movies with more upvotes have higher chance
function selectWeightedWinner(movies: Movie[], votes: { [movieId: number]: number } = {}): number {
  // Base weight of 10, plus votes (so even -5 votes still has weight 5)
  const weights = movies.map(m => Math.max(1, 10 + (votes[m.id] || 0)));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return i;
    }
  }
  return movies.length - 1; // Fallback
}

export default function RouletteWheel({ movies, votes = {}, isSpinning, onSpinComplete }: RouletteWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlayedSpinSound = useRef(false);

  useEffect(() => {
    if (!isSpinning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      hasPlayedSpinSound.current = false;
      return;
    }

    // Play spin sound once at the start
    if (!hasPlayedSpinSound.current) {
      haptic.medium();
      hasPlayedSpinSound.current = true;
    }

    // Calculate winner index using WEIGHTED selection!
    const winnerIndex = selectWeightedWinner(movies, votes);
    const totalSpins = 30 + winnerIndex; // Spin at least 30 times
    let count = 0;
    let speed = 50; // Start fast

    intervalRef.current = setInterval(() => {
      count++;
      setSpinCount(count);
      setCurrentIndex((prev) => (prev + 1) % movies.length);

      // Add light haptic on each movie change during fast spin
      if (count < totalSpins - 10) {
        haptic.light();
      }

      // Slow down gradually
      if (count > totalSpins - 10) {
        speed = 100 + (count - (totalSpins - 10)) * 50;
        clearInterval(intervalRef.current!);
        intervalRef.current = setInterval(() => {
          count++;
          setSpinCount(count);
          setCurrentIndex((prev) => (prev + 1) % movies.length);
          
          // Stronger haptic as it slows down
          haptic.medium();

          if (count >= totalSpins) {
            clearInterval(intervalRef.current!);
            // Play winner sound and haptic

            haptic.success();
            setTimeout(() => {
              onSpinComplete(movies[winnerIndex]);
            }, 500);
          }
        }, speed);
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpinning, movies, votes, onSpinComplete]);

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 glass-dark rounded-2xl">
        <p className="text-gray-400 text-lg">Add movies to start the roulette</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Display */}
      <div className="relative glass-dark rounded-3xl p-8 overflow-hidden">
        {/* Spinning indicator */}
        <AnimatePresence>
          {isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-4 right-4 z-10"
            >
              <div className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Spinning...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Movie Display */}
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              {movies[currentIndex]?.poster_path ? (
                <img
                  src={getPosterUrl(movies[currentIndex].poster_path, 'w500')}
                  alt={movies[currentIndex].title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                  {movies[currentIndex]?.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-200">
                  <span className="flex items-center gap-1">
                    ⭐ {movies[currentIndex]?.vote_average.toFixed(1)}
                  </span>
                  <span>
                    {new Date(movies[currentIndex]?.release_date).getFullYear()}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Movie Counter */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full">
              <span className="text-lg font-semibold text-purple-400">
                {currentIndex + 1}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-lg text-gray-300">{movies.length}</span>
            </div>
          </div>
        </div>

        {/* Side Previews */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-30">
          <motion.div
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-48 relative rounded-lg overflow-hidden"
          >
            {movies[(currentIndex - 1 + movies.length) % movies.length]?.poster_path && (
              <img
                src={getPosterUrl(movies[(currentIndex - 1 + movies.length) % movies.length].poster_path, 'w342')}
                alt="Previous"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </motion.div>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30">
          <motion.div
            animate={{ x: [10, -10, 10] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-48 relative rounded-lg overflow-hidden"
          >
            {movies[(currentIndex + 1) % movies.length]?.poster_path && (
              <img
                src={getPosterUrl(movies[(currentIndex + 1) % movies.length].poster_path, 'w342')}
                alt="Next"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* All Movies Preview Strip */}
      <div className="mt-6 relative overflow-hidden rounded-xl">
        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              animate={{
                scale: index === currentIndex ? 1.1 : 1,
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
              className={`relative w-16 h-24 flex-shrink-0 rounded overflow-hidden ${
                index === currentIndex ? 'ring-2 ring-purple-500' : ''
              }`}
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
