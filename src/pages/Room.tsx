import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  LogOut, 
  Play, 
  RotateCcw,
  Info,
  History as HistoryIcon,
  Vote,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Movie } from '@/lib/types';
import { 
  subscribeToRoom, 
  joinRoom, 
  leaveRoom, 
  updateUserMovies,
  toggleUserReady as firebaseToggleUserReady,
  setRoomSpinning,
  setRoomWinner,
  resetRoom as firebaseResetRoom,
  voteOnMovie,
  roomExists,
  createRoom,
  getUserHistory,
  RoomData,
  RoomUser,
  SessionHistory,
  cleanupInactiveUsers,
} from '@/lib/firebaseService';
import { getRandomColor } from '@/lib/store';
import MovieSearch from '@/components/MovieSearch';
import SelectedMovies from '@/components/SelectedMovies';
import RouletteWheel from '@/components/RouletteWheel';
import UserList from '@/components/UserList';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import VotingMovieCard from '@/components/VotingMovieCard';
import HistoryPanel from '@/components/HistoryPanel';
import SoundToggle from '@/components/SoundToggle';
import AdvancedWheelModal from '@/components/AdvancedWheelModal';

export default function RoomPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const roomCode = params.code as string;
  
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [showVoting, setShowVoting] = useState(false);
  const [showAdvancedWheel, setShowAdvancedWheel] = useState(false);

  const currentUser = user ? roomData?.users[user.uid] : null;
  const users = roomData ? Object.values(roomData.users) : [];
  // Deduplicate movies by ID to avoid duplicate keys
  const allMovies = Array.from(
    new Map(users.flatMap(u => u.selectedMovies).map(m => [m.id, m])).values()
  );

  // Subscribe to room changes
  useEffect(() => {
    if (!roomCode || !hasJoined) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      setRoomData(data);
      
      // Show winner modal when winner is set
      if (data?.selectedWinner && !showWinner) {
        setShowWinner(true);
      }
    });

    // Cleanup inactive users every minute
    const cleanupInterval = setInterval(() => {
      cleanupInactiveUsers(roomCode);
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, [roomCode, hasJoined]);

  // Load history when opening panel
  useEffect(() => {
    if (showHistory && user) {
      getUserHistory(user.uid).then(setHistory);
    }
  }, [showHistory, user]);

  const handleJoinRoom = async () => {
    if (!userName.trim() || !user) return;

    try {
      const exists = await roomExists(roomCode);
      
      const newUser: RoomUser = {
        id: user.uid,
        name: userName.trim(),
        color: getRandomColor(),
        selectedMovies: [],
        isReady: false,
        votes: {},
        lastActive: Date.now(),
      };

      if (exists) {
        await joinRoom(roomCode, newUser);
      } else {
        await createRoom(roomCode, newUser);
      }

      setHasJoined(true);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMovie = async (movie: Movie) => {
    if (!currentUser || !user) return;
    if (currentUser.selectedMovies.length >= 5) return;

    await updateUserMovies(roomCode, user.uid, [...currentUser.selectedMovies, movie]);
  };

  const handleRemoveMovie = async (movieId: number) => {
    if (!currentUser || !user) return;
    await updateUserMovies(
      roomCode,
      user.uid,
      currentUser.selectedMovies.filter(m => m.id !== movieId)
    );
  };

  const handleToggleReady = async () => {
    if (!currentUser || !user) return;
    if (currentUser.selectedMovies.length < 2) return;
    await firebaseToggleUserReady(roomCode, user.uid, !currentUser.isReady);
  };

  const handleVote = async (movieId: number, vote: number) => {
    if (!user) return;
    await voteOnMovie(roomCode, user.uid, movieId.toString(), vote);
  };

  const canSpin = users.every(u => u.isReady && u.selectedMovies.length >= 2) && users.length > 0;

  const handleSpin = async () => {
    if (!canSpin || roomData?.isSpinning) return;
    await setRoomSpinning(roomCode, true);
    setShowWinner(false);
  };

  const handleSpinComplete = async (winner: Movie) => {
    await setRoomWinner(roomCode, winner);
    await setRoomSpinning(roomCode, false);
  };

  const handleReset = async () => {
    await firebaseResetRoom(roomCode);
    setShowWinner(false);
  };

  const handleLeaveRoom = async () => {
    if (user) {
      await leaveRoom(roomCode, user.uid);
    }
    navigate('/');
  };

  // Calculate vote totals
  const getMovieVotes = (movieId: number): { total: number; userVote: number } => {
    let total = 0;
    let userVote = 0;

    users.forEach(u => {
      const vote = u.votes?.[movieId.toString()] || 0;
      total += vote;
      if (u.id === user?.uid) {
        userVote = vote;
      }
    });

    return { total, userVote };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="glass-dark rounded-2xl p-8">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-center mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-3xl p-8 max-w-md w-full"
          >
            <h1 className="text-3xl font-bold text-center mb-2">Join Room</h1>
            <p className="text-center text-gray-400 mb-6">
              Room Code: <span className="font-mono font-bold text-purple-400">{roomCode}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Enter your name"
                  className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={20}
                  autoFocus
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!userName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Join Room
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Movie Roulette</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Room:</span>
              <code className="font-mono font-bold text-purple-400 text-lg">{roomCode}</code>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <SoundToggle />
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 glass-dark hover:bg-white/10 px-4 py-2 rounded-xl transition-colors"
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 glass-dark hover:bg-white/10 px-4 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>

        {/* Winner Modal */}
        <AnimatePresence>
          {showWinner && roomData?.selectedWinner && (
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

                <div className="bg-black/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-3xl font-bold mb-2">{roomData.selectedWinner.title}</h3>
                  <div className="flex items-center gap-4 text-gray-300 mb-4">
                    <span className="flex items-center gap-1">
                      ⭐ {roomData.selectedWinner.vote_average.toFixed(1)}
                    </span>
                    <span>
                      {new Date(roomData.selectedWinner.release_date).getFullYear()}
                    </span>
                    {(() => {
                      const { total } = getMovieVotes(roomData.selectedWinner.id);
                      return total !== 0 && (
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          total > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {total > 0 ? '+' : ''}{total} votes
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-gray-400 line-clamp-3">{roomData.selectedWinner.overview}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMovieDetails(roomData.selectedWinner)}
                    className="flex-1 flex items-center justify-center gap-2 glass hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    More Details
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 rounded-xl font-semibold transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Play Again
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

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <HistoryPanel 
                  history={history} 
                  onMovieClick={(movieId) => {
                    const movie = history.find(h => h.winner.id === movieId)?.winner;
                    if (movie) {
                      setSelectedMovieDetails(movie);
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Users & Selection */}
          <div className="space-y-6">
            <UserList users={users} currentUserId={user?.uid || ''} />
            
            {currentUser && (
              <SelectedMovies
                movies={currentUser.selectedMovies}
                onRemove={handleRemoveMovie}
                userName={currentUser.name}
                userColor={currentUser.color}
              />
            )}

            {currentUser && currentUser.selectedMovies.length >= 2 && (
              <button
                onClick={handleToggleReady}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  currentUser.isReady
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {currentUser.isReady ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Ready to Spin
                  </span>
                ) : (
                  "I'm Ready!"
                )}
              </button>
            )}
          </div>

          {/* Middle Column - Roulette, Voting, or Search */}
          <div className="lg:col-span-2">
            {canSpin || roomData?.isSpinning || showWinner ? (
              <div className="space-y-6">
                {/* Voting phase button */}
                {!roomData?.isSpinning && !showWinner && allMovies.length > 0 && (
                  <button
                    onClick={() => setShowVoting(!showVoting)}
                    className="w-full glass-dark hover:bg-white/10 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Vote className="w-5 h-5" />
                    {showVoting ? 'Hide Voting' : 'Vote on Movies'}
                  </button>
                )}

                {/* Voting Grid */}
                {showVoting && !roomData?.isSpinning && !showWinner && (
                  <div className="glass-dark rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Vote on Movies</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Upvote movies you want to watch, downvote ones you don't
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {allMovies.map((movie) => {
                        const { total, userVote } = getMovieVotes(movie.id);
                        const isOwnMovie = currentUser?.selectedMovies.some(m => m.id === movie.id);
                        return (
                          <VotingMovieCard
                            key={movie.id}
                            movie={movie}
                            userVote={userVote}
                            totalVotes={total}
                            onVote={handleVote}
                            isOwnMovie={isOwnMovie}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Roulette */}
                <RouletteWheel
                  movies={allMovies}
                  isSpinning={roomData?.isSpinning || false}
                  onSpinComplete={handleSpinComplete}
                />

                {!roomData?.isSpinning && !showWinner && (
                  <button
                    onClick={handleSpin}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                    Spin the Wheel!
                  </button>
                )}
              </div>
            ) : currentUser && !currentUser.isReady ? (
              <div className="glass-dark rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Search & Select Movies</h2>
                    <p className="text-gray-400 mt-1">
                      Choose 2-5 movies you'd like to watch
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdvancedWheel(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Advanced Wheel</span>
                  </button>
                </div>
                <MovieSearch
                  onAddMovie={handleAddMovie}
                  selectedMovies={currentUser.selectedMovies}
                  maxSelections={5}
                />
              </div>
            ) : (
              <div className="glass-dark rounded-2xl p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Waiting for others...</h3>
                <p className="text-gray-400">
                  Everyone needs to be ready before we can spin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
