import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Star, Clock, Film, Shuffle, Globe, Tv, User, Tag } from 'lucide-react';
import { GENRE_LIST, GenreId } from '@/lib/genres';
import { tmdbApi, getPosterUrl, Person, Keyword } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import { haptic } from '@/lib/sounds';
import { useDebounce } from '@/hooks/useDebounce';

interface AdvancedWheelModalProps {
  onClose: () => void;
  onMovieSelected: (movie: Movie) => void;
}

const LANGUAGES = [
  { id: 'any', label: 'Any Language', code: undefined, exclude: undefined },
  { id: 'en', label: 'English Only', code: 'en', exclude: undefined },
  { id: 'es', label: 'Spanish Only', code: 'es', exclude: undefined },
  { id: 'foreign', label: 'Foreign (Non-English)', code: undefined, exclude: 'en' },
];

// TMDB watch provider IDs for US region
const STREAMING_PROVIDERS = [
  { id: 0, label: 'Any', providerId: undefined },
  { id: 8, label: 'Netflix', providerId: '8' },
  { id: 337, label: 'Disney+', providerId: '337' },
  { id: 1899, label: 'Max', providerId: '1899' },
  { id: 9, label: 'Prime Video', providerId: '9' },
  { id: 15, label: 'Hulu', providerId: '15' },
  { id: 387, label: 'Peacock', providerId: '387' },
  { id: 531, label: 'Paramount+', providerId: '531' },
  { id: 350, label: 'Apple TV+', providerId: '350' },
];

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
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [selectedStreaming, setSelectedStreaming] = useState(STREAMING_PROVIDERS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Movie | null>(null);

  // Person search
  const [personQuery, setPersonQuery] = useState('');
  const [personResults, setPersonResults] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personType, setPersonType] = useState<'cast' | 'crew'>('cast');
  const debouncedPersonQuery = useDebounce(personQuery, 300);

  // Keyword search
  const [keywordQuery, setKeywordQuery] = useState('');
  const [keywordResults, setKeywordResults] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);
  const debouncedKeywordQuery = useDebounce(keywordQuery, 300);

  // Search for people
  useEffect(() => {
    if (debouncedPersonQuery.length >= 2) {
      tmdbApi.searchPerson(debouncedPersonQuery).then(res => {
        setPersonResults(res.results.slice(0, 6));
      });
    } else {
      setPersonResults([]);
    }
  }, [debouncedPersonQuery]);

  // Search for keywords
  useEffect(() => {
    if (debouncedKeywordQuery.length >= 2) {
      tmdbApi.searchKeyword(debouncedKeywordQuery).then(res => {
        setKeywordResults(res.results.slice(0, 6));
      });
    } else {
      setKeywordResults([]);
    }
  }, [debouncedKeywordQuery]);

  const handleSpin = async () => {
    setIsSpinning(true);

    haptic.medium();

    try {
      // Build discover params
      const decade = DECADES.find(d => d.label === selectedDecade);
      const params: any = {
        page: 1, // Start with page 1, we'll pick a random valid page after
        sort_by: 'popularity.desc', // Get popular movies first
        'vote_count.gte': 50, // Ensure movies have enough votes to be meaningful
      };

      if (selectedGenres.length > 0) {
        // Use pipe for OR logic - movies can have ANY of these genres
        params.with_genres = selectedGenres.join('|');
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

      if (selectedRuntime.min) {
        params['with_runtime.gte'] = selectedRuntime.min;
      }
      if (selectedRuntime.max) {
        params['with_runtime.lte'] = selectedRuntime.max;
      }

      // Language filter
      if (selectedLanguage.code) {
        params.with_original_language = selectedLanguage.code;
      }
      if (selectedLanguage.exclude) {
        params.without_original_language = selectedLanguage.exclude;
      }

      // Streaming provider filter
      if (selectedStreaming.providerId) {
        params.with_watch_providers = selectedStreaming.providerId;
        params.watch_region = 'US';
      }

      // Person filter (actor or director)
      if (selectedPerson) {
        if (personType === 'cast') {
          params.with_cast = selectedPerson.id.toString();
        } else {
          params.with_crew = selectedPerson.id.toString();
        }
      }

      // Keywords filter - use pipe for OR logic (any of these keywords)
      if (selectedKeywords.length > 0) {
        params.with_keywords = selectedKeywords.map(k => k.id).join('|');
      }

      // First fetch to see how many pages exist
      let response = await tmdbApi.discoverMovies(params);

      // If no results with strict filters, try relaxing them
      if (response.results.length === 0 && selectedStreaming.providerId) {
        // Try without streaming filter
        delete params.with_watch_providers;
        delete params.watch_region;
        response = await tmdbApi.discoverMovies(params);

        if (response.results.length > 0) {
          console.log('Relaxed streaming filter to find results');
        }
      }

      if (response.results.length === 0 && params['vote_count.gte']) {
        // Try with lower vote threshold
        params['vote_count.gte'] = 10;
        response = await tmdbApi.discoverMovies(params);
      }

      if (response.results.length === 0) {
        alert('No movies found with these filters. Try loosening your criteria!');
        setIsSpinning(false);
        return;
      }

      // If there are multiple pages, pick a random valid page for variety
      const totalPages = Math.min(response.total_pages || 1, 10); // Cap at 10 pages
      if (totalPages > 1) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        if (randomPage !== 1) {
          params.page = randomPage;
          response = await tmdbApi.discoverMovies(params);
        }
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
        className="glass-dark rounded-3xl p-4 sm:p-8 max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold">Advanced Wheel</h2>
              <p className="text-gray-400 text-sm sm:text-base hidden sm:block">Let fate decide with smart filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-target"
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

            {/* Language Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Language</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage.id === lang.id;
                  return (
                    <motion.button
                      key={lang.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {lang.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Streaming Provider Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Streaming On</h3>
                <span className="text-xs text-gray-400">(US)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {STREAMING_PROVIDERS.map((provider) => {
                  const isSelected = selectedStreaming.id === provider.id;
                  return (
                    <motion.button
                      key={provider.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStreaming(provider)}
                      className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {provider.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Person Search (Actor/Director) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Actor or Director</h3>
              </div>

              {/* Person type toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setPersonType('cast')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    personType === 'cast'
                      ? 'bg-purple-500/50 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Actor
                </button>
                <button
                  onClick={() => setPersonType('crew')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    personType === 'crew'
                      ? 'bg-purple-500/50 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Director
                </button>
              </div>

              {/* Selected person chip */}
              {selectedPerson && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {selectedPerson.name}
                    <button
                      onClick={() => setSelectedPerson(null)}
                      className="hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                </div>
              )}

              {/* Search input */}
              {!selectedPerson && (
                <div className="relative">
                  <input
                    type="text"
                    value={personQuery}
                    onChange={(e) => setPersonQuery(e.target.value)}
                    placeholder={`Search for ${personType === 'cast' ? 'an actor' : 'a director'}...`}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {personResults.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      {personResults.map((person) => (
                        <button
                          key={person.id}
                          onClick={() => {
                            setSelectedPerson(person);
                            setPersonQuery('');
                            setPersonResults([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-xs text-gray-400">{person.known_for_department}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Keywords</h3>
                <span className="text-sm text-gray-400">(e.g., "time travel", "heist")</span>
              </div>

              {/* Selected keywords chips */}
              {selectedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedKeywords.map((keyword) => (
                    <span
                      key={keyword.id}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {keyword.name}
                      <button
                        onClick={() => setSelectedKeywords(prev => prev.filter(k => k.id !== keyword.id))}
                        className="hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={keywordQuery}
                  onChange={(e) => setKeywordQuery(e.target.value)}
                  placeholder="Search for keywords..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {keywordResults.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {keywordResults.map((keyword) => (
                      <button
                        key={keyword.id}
                        onClick={() => {
                          if (!selectedKeywords.find(k => k.id === keyword.id)) {
                            setSelectedKeywords(prev => [...prev, keyword]);
                          }
                          setKeywordQuery('');
                          setKeywordResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
                      >
                        {keyword.name}
                      </button>
                    ))}
                  </div>
                )}
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
                {winner.poster_path ? (
                  <img
                    src={getPosterUrl(winner.poster_path, 'w500')}
                    alt={winner.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center rounded-xl text-6xl">
                    🎬
                  </div>
                )}
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
