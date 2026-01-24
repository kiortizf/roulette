import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Info, RotateCcw, Play, Copy, Check } from 'lucide-react';
import { Movie } from '@/lib/types';
import MovieSearch from '@/components/MovieSearch';
import SelectedMovies from '@/components/SelectedMovies';
import RouletteWheel from '@/components/RouletteWheel';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import SoundToggle from '@/components/SoundToggle';
import AdvancedWheelModal from '@/components/AdvancedWheelModal';
import MoodPicker from '@/components/MoodPicker';
import { soundManager, haptic } from '@/lib/sounds';
import { getPosterUrl } from '@/lib/tmdb';

export default function SoloPage() {
  const navigate = useNavigate();
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Movie | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [showAdvancedWheel, setShowAdvancedWheel] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Update page title
  useEffect(() => {
    document.title = 'Solo Mode | Popcorn Panic';
    return () => {
      document.title = 'Popcorn Panic - Movie Night Roulette';
    };
  }, []);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#ff00ff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#ff00ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    });

    frame();
  }, []);

  const handleAddMovie = (movie: Movie) => {
    if (selectedMovies.length >= 10) return;
    if (selectedMovies.some(m => m.id === movie.id)) return;
    soundManager.pop();
    haptic.light();
    setSelectedMovies([...selectedMovies, movie]);
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies(selectedMovies.filter(m => m.id !== movieId));
  };

  const handleShuffleMovies = () => {
    const movies = [...selectedMovies];
    for (let i = movies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movies[i], movies[j]] = [movies[j], movies[i]];
    }
    soundManager.pop();
    haptic.light();
    setSelectedMovies(movies);
  };

  const handleSpin = () => {
    if (selectedMovies.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setShowWinner(false);
  };

  const handleSpinComplete = (winningMovie: Movie) => {
    setWinner(winningMovie);
    setIsSpinning(false);
    setShowWinner(true);
    setTimeout(() => fireConfetti(), 300);
  };

  const handleReset = () => {
    setWinner(null);
    setShowWinner(false);
  };

  const canSpin = selectedMovies.length >= 2;

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <motion.h1
                className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl flex items-center gap-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span>🎬</span>
                SOLO SPIN
                <span>🎲</span>
              </motion.h1>
              <p className="text-white/70 text-sm font-medium">Just you and the wheel of fate</p>
            </div>
          </div>
          <SoundToggle />
        </motion.div>

        {/* Winner Modal */}
        <AnimatePresence>
          {showWinner && winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowWinner(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="glass-dark rounded-3xl p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                    Tonight's Movie!
                  </h2>
                  <p className="text-gray-400">The wheel has spoken</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-black/30 rounded-2xl p-6 mb-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-40 h-60 mx-auto sm:mx-0 flex-shrink-0"
                  >
                    {winner.poster_path ? (
                      <img
                        src={getPosterUrl(winner.poster_path, 'w342')}
                        alt={winner.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center rounded-xl text-6xl">
                        🎬
                      </div>
                    )}
                  </motion.div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2">{winner.title}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-300 mb-4">
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
                    onClick={() => {
                      const year = new Date(winner.release_date).getFullYear();
                      const text = `🎬 Tonight I'm watching: ${winner.title} (${year}) ⭐ ${winner.vote_average.toFixed(1)}\n\nPicked with Popcorn Panic! 🍿`;
                      navigator.clipboard.writeText(text);
                      setCopiedResult(true);
                      setTimeout(() => setCopiedResult(false), 2000);
                    }}
                    className="flex items-center justify-center gap-2 glass hover:bg-white/10 px-4 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {copiedResult ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setSelectedMovieDetails(winner)}
                    className="flex-1 flex items-center justify-center gap-2 glass hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    Details
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 rounded-xl font-semibold transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Details Modal */}
        <AnimatePresence>
          {selectedMovieDetails && (
            <MovieDetailsModal
              movie={selectedMovieDetails}
              onClose={() => setSelectedMovieDetails(null)}
            />
          )}
        </AnimatePresence>

        {/* Advanced Wheel Modal */}
        <AnimatePresence>
          {showAdvancedWheel && (
            <AdvancedWheelModal
              onClose={() => setShowAdvancedWheel(false)}
              onMovieSelected={handleAddMovie}
            />
          )}
        </AnimatePresence>

        {/* Mood Picker Modal */}
        <AnimatePresence>
          {showMoodPicker && (
            <MoodPicker
              onClose={() => setShowMoodPicker(false)}
              onMovieSelected={handleAddMovie}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Selected Movies */}
          <div className="space-y-6">
            <SelectedMovies
              movies={selectedMovies}
              onRemove={handleRemoveMovie}
              onShuffle={handleShuffleMovies}
              userName="You"
              userColor="#8B5CF6"
              minSelections={2}
              maxSelections={10}
            />
          </div>

          {/* Right Column - Search or Wheel */}
          <div className="lg:col-span-2">
            {canSpin ? (
              <div className="space-y-6">
                <RouletteWheel
                  movies={selectedMovies}
                  votes={{}}
                  isSpinning={isSpinning}
                  onSpinComplete={handleSpinComplete}
                />

                {!isSpinning && !showWinner && (
                  <motion.button
                    onClick={handleSpin}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-2xl border-4 border-white/30"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139,92,246,0.5)',
                        '0 0 40px rgba(236,72,153,0.5)',
                        '0 0 20px rgba(139,92,246,0.5)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="text-3xl"
                    >
                      🎰
                    </motion.span>
                    <span className="drop-shadow-lg">SPIN THE WHEEL!</span>
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-3xl"
                    >
                      🎲
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="glass-dark rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Pick Your Movies</h2>
                    <p className="text-gray-400 mt-1">
                      Add 2-10 movies to spin
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMoodPicker(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                    >
                      <span className="text-lg">😌</span>
                      <span className="hidden sm:inline">Mood</span>
                    </button>
                    <button
                      onClick={() => setShowAdvancedWheel(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Filters</span>
                    </button>
                  </div>
                </div>
                <MovieSearch
                  onAddMovie={handleAddMovie}
                  selectedMovies={selectedMovies}
                  maxSelections={10}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
