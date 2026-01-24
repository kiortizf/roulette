import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shuffle, Plus, Sparkles } from 'lucide-react';
import { MOOD_PRESETS, MoodPreset } from '@/lib/moods';
import { tmdbApi, getPosterUrl } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import { haptic } from '@/lib/sounds';

interface MoodPickerProps {
  onClose: () => void;
  onMovieSelected: (movie: Movie) => void;
}

export default function MoodPicker({ onClose, onMovieSelected }: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodPreset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);

  const handleMoodSelect = async (mood: MoodPreset) => {
    setSelectedMood(mood);
    setIsLoading(true);
    setMovie(null);

    haptic.light();

    try {
      const params: any = {
        page: Math.floor(Math.random() * 5) + 1, // Random page 1-5
        sort_by: 'popularity.desc',
      };

      if (mood.genres.length > 0) {
        params.with_genres = mood.genres.join(',');
      }

      if (mood.minRating) {
        params['vote_average.gte'] = mood.minRating;
      }

      if (mood.maxRating) {
        params['vote_average.lte'] = mood.maxRating;
      }

      // For underrated gems - limit vote count
      if (mood.maxVoteCount) {
        params['vote_count.lte'] = mood.maxVoteCount;
        params['vote_count.gte'] = 50; // Still need some votes
      } else {
        // Ensure we get movies with enough votes
        params['vote_count.gte'] = 100;
      }

      // For foreign films
      if (mood.language === 'foreign') {
        params.without_original_language = 'en';
      } else if (mood.language) {
        params.with_original_language = mood.language;
      }

      // For classic/older films
      if (mood.releaseDateBefore) {
        params['primary_release_date.lte'] = mood.releaseDateBefore;
      }
      if (mood.releaseDateAfter) {
        params['primary_release_date.gte'] = mood.releaseDateAfter;
      }

      // For short films
      if (mood.maxRuntime) {
        params.with_runtime = { max: mood.maxRuntime };
      }

      const response = await tmdbApi.discoverMovies(params);

      if (response.results.length === 0) {
        alert('No movies found for this mood. Try another!');
        setIsLoading(false);
        return;
      }

      // Pick a random movie
      const randomMovie = response.results[Math.floor(Math.random() * response.results.length)];
      setMovie(randomMovie);

      haptic.success();
    } catch (error) {
      console.error('Error fetching mood movies:', error);
      alert('Error finding movies. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnother = () => {
    if (selectedMood) {
      handleMoodSelect(selectedMood);
    }
  };

  const handleAddMovie = () => {
    if (movie) {
      onMovieSelected(movie);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-dark rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Pick by Mood</h2>
              <p className="text-gray-400">What are you in the mood for?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!movie ? (
            <motion.div
              key="moods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            >
              {MOOD_PRESETS.map((mood, index) => (
                <motion.button
                  key={mood.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                    selectedMood?.id === mood.id && isLoading
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-white'
                      : 'bg-white/10 hover:bg-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="font-bold text-sm text-center">{mood.label}</span>
                  <span className="text-xs text-gray-400 text-center line-clamp-2">
                    {mood.description}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                {selectedMood?.emoji}
              </motion.div>

              <h3 className="text-2xl font-bold mb-2 text-gray-300">
                For your <span className="text-purple-400">{selectedMood?.label}</span> mood...
              </h3>

              <div className="flex flex-col sm:flex-row gap-6 bg-black/30 rounded-2xl p-6 mb-6">
                <div className="relative w-48 h-72 mx-auto sm:mx-0 flex-shrink-0">
                  {movie.poster_path ? (
                    <img
                      src={getPosterUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center rounded-xl text-6xl">
                      🎬
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4 className="text-2xl font-bold mb-3">{movie.title}</h4>
                  <div className="flex flex-wrap gap-3 text-gray-300 mb-4">
                    <span className="flex items-center gap-1">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                    {movie.release_date && (
                      <span>
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 line-clamp-4">{movie.overview}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMovie(null)}
                  className="flex-1 glass hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  ← Pick Different Mood
                </button>
                <button
                  onClick={handleTryAnother}
                  className="flex-1 glass hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-5 h-5" />
                  Try Another
                </button>
                <button
                  onClick={handleAddMovie}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Picks
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
