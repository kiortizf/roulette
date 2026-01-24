import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  LogOut,
  Play,
  RotateCcw,
  Info,
  History as HistoryIcon,
  Vote,
  Ban,
  BarChart3,
  Share2,
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
import MoodPicker from '@/components/MoodPicker';
import StatsPanel from '@/components/StatsPanel';
import FloatingReactions from '@/components/FloatingReactions';
import ReactionBar from '@/components/ReactionBar';
import { soundManager, haptic } from '@/lib/sounds';

export default function RoomPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const roomCode = params.code as string;
  
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [showVoting, setShowVoting] = useState(false);
  const [showAdvancedWheel, setShowAdvancedWheel] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [hasVetoed, setHasVetoed] = useState(false);

  // Fire confetti celebration!
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

    // Big initial burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    });

    frame();
  }, []);

  const currentUser = user ? roomData?.users?.[user.uid] : null;
  const users = roomData?.users ? Object.values(roomData.users) : [];
  // Deduplicate movies by ID to avoid duplicate keys
  const allMovies = Array.from(
    new Map(
      users
        .flatMap(u => u.selectedMovies || [])
        .filter(m => m && m.id)
        .map(m => [m.id, m])
    ).values()
  );

  // Subscribe to room changes
  useEffect(() => {
    if (!roomCode || !hasJoined) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      setRoomData(data);

      // Show winner modal when winner is set
      if (data?.selectedWinner && !showWinner) {
        setShowWinner(true);
        setHasVetoed(false); // Reset veto for new round
        setUserReaction(null); // Reset reaction
        // Fire confetti!
        setTimeout(() => fireConfetti(), 300);
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
    if (!userName.trim()) {
      console.log('No username provided');
      return;
    }
    if (!user) {
      console.log('No user authenticated - waiting for auth');
      return;
    }

    setIsJoining(true);
    console.log('Joining room:', roomCode, 'as user:', user.uid);

    try {
      const exists = await roomExists(roomCode);
      console.log('Room exists:', exists);
      
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
        console.log('Joined existing room');
      } else {
        await createRoom(roomCode, newUser);
        console.log('Created new room');
      }

      setHasJoined(true);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room: ' + (error as Error).message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddMovie = async (movie: Movie) => {
    if (!currentUser || !user) return;
    const movies = currentUser.selectedMovies || [];
    if (movies.length >= 5) return;

    soundManager.pop();
    haptic.light();
    await updateUserMovies(roomCode, user.uid, [...movies, movie]);
  };

  const handleRemoveMovie = async (movieId: number) => {
    if (!currentUser || !user) return;
    const movies = currentUser.selectedMovies || [];
    await updateUserMovies(
      roomCode,
      user.uid,
      movies.filter(m => m.id !== movieId)
    );
  };

  const handleToggleReady = async () => {
    if (!currentUser || !user) return;
    if ((currentUser.selectedMovies?.length || 0) < 2) return;
    soundManager.click();
    haptic.medium();
    await firebaseToggleUserReady(roomCode, user.uid, !currentUser.isReady);
  };

  const handleVote = async (movieId: number, vote: number) => {
    if (!user) return;
    soundManager.vote(vote > 0);
    haptic.light();
    await voteOnMovie(roomCode, user.uid, movieId.toString(), vote);
  };

  const canSpin = users.length > 0 && users.every(u => u.isReady && (u.selectedMovies?.length || 0) >= 2);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl p-8">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          <p className="text-center mt-4 text-white font-bold">Loading the popcorn...</p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h1 className="text-4xl font-black text-center mb-2 text-white drop-shadow-lg">🎬 JOIN THE PARTY!</h1>
            <p className="text-center text-white font-bold mb-6">
              Room: <span className="font-mono font-black text-yellow-200 text-xl">{roomCode}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
                  What's your name? ✨
                </label>
                <input
                  type="text"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isJoining && handleJoinRoom()}
                  placeholder="Enter your name"
                  className="w-full bg-white/30 backdrop-blur-sm border-2 border-white/50 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 font-semibold"
                  maxLength={20}
                  autoFocus
                  disabled={isJoining}
                />
              </div>

              {authLoading && (
                <p className="text-white/80 text-sm text-center">🔄 Connecting to server...</p>
              )}

              <motion.button
                whileHover={{ scale: isJoining ? 1 : 1.05 }}
                whileTap={{ scale: isJoining ? 1 : 0.95 }}
                onClick={handleJoinRoom}
                disabled={!userName.trim() || isJoining || authLoading}
                className="w-full bg-white text-red-600 hover:bg-yellow-100 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed py-4 rounded-xl font-black text-xl transition-all duration-300 shadow-lg"
              >
                {isJoining ? '🍿 JOINING...' : authLoading ? '⏳ LOADING...' : '🍿 LET\'S GO!'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // Get vote breakdown by user for a movie
  const getVoteBreakdown = (movieId: number) => {
    return users.map(u => ({
      name: u.name,
      color: u.color,
      vote: u.votes?.[movieId.toString()] || 0
    })).filter(v => v.vote !== 0);
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Floating Reactions */}
      <FloatingReactions roomCode={roomCode} />

      {/* Reaction Bar - show during selection phase */}
      {currentUser && !roomData?.isSpinning && !showWinner && (
        <ReactionBar
          roomCode={roomCode}
          userId={user?.uid || ''}
          userName={currentUser.name}
          userColor={currentUser.color}
        />
      )}

      {/* CHAOS BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated blobs */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-[400px] h-[400px] bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px] bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-[350px] h-[350px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>

        {/* Subtle floating accents - reduced and calmer */}
        {[
          { emoji: '🍿', left: '5%', top: '15%' },
          { emoji: '🎬', left: '90%', top: '25%' },
          { emoji: '⭐', left: '85%', top: '75%' },
          { emoji: '🎥', left: '10%', top: '80%' },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl select-none opacity-40"
            style={{ left: item.left, top: item.top }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* EPIC HEADER */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-center sm:text-left">
            <motion.h1
              className="text-4xl sm:text-5xl font-black text-white drop-shadow-2xl flex items-center gap-3 justify-center sm:justify-start"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🍿
              </motion.span>
              POPCORN PANIC!
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🔥
              </motion.span>
            </motion.h1>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="text-white/80 font-bold text-sm">ROOM CODE:</span>
              <motion.code
                className="font-mono font-black text-yellow-300 text-2xl bg-black/40 px-4 py-1 rounded-xl border-2 border-yellow-400/50"
                whileHover={{ scale: 1.05 }}
              >
                {roomCode}
              </motion.code>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className="p-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <Copy className="w-5 h-5 text-black" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyInviteLink}
                className="p-2 bg-green-400 hover:bg-green-300 rounded-lg transition-colors"
                title="Copy invite link"
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-black" />
                ) : (
                  <Share2 className="w-5 h-5 text-black" />
                )}
              </motion.button>
              {(copied || copiedLink) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-green-400 font-bold text-sm"
                >
                  {copiedLink ? 'Link copied!' : 'Copied!'}
                </motion.span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <SoundToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/50 border-2 border-blue-400/50 px-4 py-2 rounded-xl transition-colors font-bold"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-purple-500/30 hover:bg-purple-500/50 border-2 border-purple-400/50 px-4 py-2 rounded-xl transition-colors font-bold"
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 bg-red-500/30 hover:bg-red-500/50 border-2 border-red-400/50 px-4 py-2 rounded-xl transition-colors font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </motion.button>
          </div>
        </motion.div>

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

                <div className="bg-black/30 rounded-2xl p-6 mb-4">
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

                {/* Emoji Reactions */}
                <div className="mb-4">
                  <p className="text-center text-gray-400 text-sm mb-2">How do you feel about this?</p>
                  <div className="flex justify-center gap-2">
                    {['😍', '🔥', '😂', '🤮', '👏', '💀'].map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setUserReaction(emoji)}
                        className={`text-3xl p-2 rounded-xl transition-all ${
                          userReaction === emoji
                            ? 'bg-purple-500/50 ring-2 ring-purple-400'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                  {userReaction && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-purple-300 text-sm mt-2"
                    >
                      You reacted with {userReaction}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3 mb-3">
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

                {/* Veto Button */}
                {!hasVetoed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      setHasVetoed(true);
                      setShowWinner(false);
                      // Clear winner first, then trigger respin
                      await setRoomWinner(roomCode, null);
                      await setRoomSpinning(roomCode, true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 py-3 rounded-xl font-bold transition-all border-2 border-red-400/50"
                  >
                    <Ban className="w-5 h-5" />
                    VETO! (Use your 1 veto to respin)
                  </motion.button>
                )}
                {hasVetoed && (
                  <p className="text-center text-red-400/70 text-sm">
                    You already used your veto this round
                  </p>
                )}
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

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowStats(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <StatsPanel stats={roomData?.stats} users={users} />
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
                movies={currentUser.selectedMovies || []}
                onRemove={handleRemoveMovie}
                userName={currentUser.name}
                userColor={currentUser.color}
              />
            )}

            {currentUser && (currentUser.selectedMovies?.length || 0) >= 2 && (
              <motion.button
                onClick={handleToggleReady}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all border-2 ${
                  currentUser.isReady
                    ? 'bg-green-500 hover:bg-green-600 border-green-300'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-yellow-300 animate-pulse'
                }`}
              >
                {currentUser.isReady ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-6 h-6" />
                    READY TO SPIN! 🎉
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      👆
                    </motion.span>
                    LOCK IT IN!
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                    >
                      🔥
                    </motion.span>
                  </span>
                )}
              </motion.button>
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

                {/* Voting Grid - ENHANCED */}
                {showVoting && !roomData?.isSpinning && !showWinner && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl p-6 border-2 border-purple-400/30"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-3xl"
                      >
                        🗳️
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-black">VOTE TIME!</h3>
                        <p className="text-purple-300 text-sm font-medium">
                          Everyone can see the votes in real-time!
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {allMovies.map((movie) => {
                        const { total, userVote } = getMovieVotes(movie.id);
                        const isOwnMovie = currentUser?.selectedMovies?.some(m => m.id === movie.id);
                        const voteBreakdown = getVoteBreakdown(movie.id);
                        return (
                          <div key={movie.id} className="space-y-2">
                            <VotingMovieCard
                              movie={movie}
                              userVote={userVote}
                              totalVotes={total}
                              onVote={handleVote}
                              isOwnMovie={isOwnMovie}
                            />
                            {/* Show who voted */}
                            {voteBreakdown.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {voteBreakdown.map((v, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                      v.vote > 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                                    }`}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: v.color }}
                                    />
                                    {v.name.slice(0, 6)}
                                    {v.vote > 0 ? '👍' : '👎'}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Roulette - with weighted votes! */}
                <RouletteWheel
                  movies={allMovies}
                  votes={Object.fromEntries(allMovies.map(m => [m.id, getMovieVotes(m.id).total]))}
                  isSpinning={roomData?.isSpinning || false}
                  onSpinComplete={handleSpinComplete}
                />

                {!roomData?.isSpinning && !showWinner && (
                  <motion.button
                    onClick={handleSpin}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-2xl border-4 border-white/30"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255,0,100,0.5)',
                        '0 0 40px rgba(255,200,0,0.5)',
                        '0 0 20px rgba(255,0,100,0.5)',
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
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMoodPicker(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                    >
                      <span className="text-lg">😌</span>
                      <span className="hidden sm:inline">Pick by Mood</span>
                    </button>
                    <button
                      onClick={() => setShowAdvancedWheel(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Advanced Wheel</span>
                    </button>
                  </div>
                </div>
                <MovieSearch
                  onAddMovie={handleAddMovie}
                  selectedMovies={currentUser.selectedMovies || []}
                  maxSelections={5}
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-3xl p-12 text-center border-2 border-purple-400/30"
              >
                <div className="flex justify-center gap-4 mb-6">
                  {['🍿', '⏳', '🎬'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-5xl"
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
                <h3 className="text-2xl font-black mb-2 text-purple-200">
                  WAITING FOR THE CREW...
                </h3>
                <p className="text-purple-300 font-medium mb-4">
                  Everyone needs to pick movies and hit ready!
                </p>
                <div className="flex justify-center gap-2">
                  {users.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border-2 ${
                        u.isReady ? 'border-green-400' : 'border-yellow-400 animate-pulse'
                      }`}
                      style={{ backgroundColor: u.color }}
                      title={`${u.name}: ${u.isReady ? 'Ready!' : 'Picking...'}`}
                    >
                      {u.isReady ? '✓' : '...'}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
