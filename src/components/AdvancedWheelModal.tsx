import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Star, Clock, Film, Shuffle } from 'lucide-react';
import { GENRE_LIST, GenreId } from '@/lib/genres';
import { tmdbApi, getPosterUrl } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import { haptic } from '@/lib/sounds';


interface AdvancedWheelModalProps {
  onClose: () => void;
  onMovieSelected: (movie: Movie) => void;
}

const DECADES = [
  { label: '2020s', start: '2020-01-01', end: '2029-12-31' },
  { label: '2010s', start: '2010-01-01', end: '2019-12-31' },
  { label: '2000s', start: '2000-01-01', end: '2009-12-31' },
  { label: '1990s', start: '1990-01-01', end: '1999-12-31' },
  { label: '1980s', start: '1980-01-01', end: '1989-12-31' },
  { label: '1970s', start: '1970-01-01', end: '1979-12-31' },
];

const RATINGS = [
  { label: 'Any Rating', min: 0, max: 10 },
  { label: 'Highly Rated (8+)', min: 8, max: 10 },
  { label: 'Good (7+)', min: 7, max: 10 },
  { label: 'Decent (6+)', min: 6, max: 10 },
  { label: 'Hidden Gems (6-7.5)', min: 6, max: 7.5 },
];

const RUNTIMES = [
  { label: 'Any Length', min: undefined, max: undefined },
  { label: 'Short (<90 min)', min: undefined, max: 90 },
  { label: 'Medium (90-120 min)', min: 90, max: 120 },
  { label: 'Long (120-150 min)', min: 120, max: 150 },
  { label: 'Epic (150+ min)', min: 150, max: undefined },
];

export default function AdvancedWheelModal({ onClose, onMovieSelected }: AdvancedWheelModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<GenreId[]>([]);
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedRating, setSelectedRating] = useState(RATINGS[0]);
  const [selectedRuntime, setSelectedRuntime] = useState(RUNTIMES[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Movie | null>(null);

  const handleSpin = async () => {
    setIsSpinning(true);

    haptic.medium();

    try {
      // Build discover params
      const decade = DECADES.find(d => d.label === selectedDecade);
      const params: any = {
        page: Math.floor(Math.random() * 3) + 1, // Random page 1-3 for variety
      };

      if (selectedGenres.length > 0) {
        params.with_genres = selectedGenres.join(',');
      }

      if (decade) {
        params['primary_release_date.gte'] = decade.start;
        params['primary_release_date.lte'] = decade.end;
      }

      if (selectedRating.min > 0) {
        params['vote_average.gte'] = selectedRating.min;
      }
      if (selectedRating.max < 10) {
        params['vote_average.lte'] = selectedRating.max;
      }

      if (selectedRuntime.min || selectedRuntime.max) {
        params.with_runtime = {
          min: selectedRuntime.min,
          max: selectedRuntime.max,
        };
      }

      // Fetch movies
      const response = await tmdbApi.discoverMovies(params);
      
      if (response.results.length === 0) {
        alert('No movies found with these filters. Try loosening your criteria!');
        setIsSpinning(false);
        return;
      }

      // Pick random movie from results
      const randomMovie = response.results[Math.floor(Math.random() * response.results.length)];
      
      // Simulate spin delay
      setTimeout(() => {
        setWinner(randomMovie);
        setIsSpinning(false);

        haptic.success();
      }, 2000);
    } catch (error) {
      console.error('Error fetching random movie:', error);
      alert('Error finding a movie. Please try again!');
      setIsSpinning(false);
    }
  };

  const handleSelect = () => {
    if (winner) {
      onMovieSelected(winner);
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Advanced Wheel</h2>
              <p className="text-gray-400">Let fate decide with smart filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!winner ? (
          <div className="space-y-6">
            {/* Genre Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Genres</h3>
                <span className="text-sm text-gray-400">(optional)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENRE_LIST.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <motion.button
                      key={genre.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {

                        setSelectedGenres(prev =>
                          prev.includes(genre.id)
                            ? prev.filter(id => id !== genre.id)
                            : [...prev, genre.id]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {genre.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Decade Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Era</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DECADES.map((decade) => {
                  const isSelected = selectedDecade === decade.label;
                  return (
                    <motion.button
                      key={decade.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {

                        setSelectedDecade(isSelected ? '' : decade.label);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {decade.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Rating Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Minimum Rating</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {RATINGS.map((rating) => {
                  const isSelected = selectedRating.label === rating.label;
                  return (
                    <motion.button
                      key={rating.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {

                        setSelectedRating(rating);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {rating.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Runtime Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Runtime</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {RUNTIMES.map((runtime) => {
                  const isSelected = selectedRuntime.label === runtime.label;
                  return (
                    <motion.button
                      key={runtime.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {

                        setSelectedRuntime(runtime);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {runtime.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Spin Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
            >
              {isSpinning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shuffle className="w-6 h-6" />
                  </motion.div>
                  Finding Your Movie...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Spin the Advanced Wheel!
                </>
              )}
            </motion.button>
          </div>
        ) : (
          /* Winner Display */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Your Random Pick!
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 bg-black/30 rounded-2xl p-6 mb-6">
              <div className="relative w-48 h-72 mx-auto sm:mx-0 flex-shrink-0">
                <img
                  src={getPosterUrl(winner.poster_path, 'w500')}
                  alt={winner.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className="text-2xl font-bold mb-3">{winner.title}</h4>
                <div className="flex flex-wrap gap-3 text-gray-300 mb-4">
                  <span className="flex items-center gap-1">
                    ⭐ {winner.vote_average.toFixed(1)}
                  </span>
                  <span>
                    {new Date(winner.release_date).getFullYear()}
                  </span>
                </div>
                <p className="text-gray-400 line-clamp-4">{winner.overview}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSpin}
                className="flex-1 glass hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Shuffle className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={handleSelect}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 rounded-xl font-semibold transition-all"
              >
                Add to Selections
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
