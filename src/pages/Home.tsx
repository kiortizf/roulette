import { useState, useMemo, useEffect } from 'react';
// Onboarding modal component
function OnboardingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl">×</button>
        <h2 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2"><Sparkles className="w-6 h-6" /> How Popcorn Panic Works</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Create or join a room to spin the movie wheel with friends, or try Solo mode for yourself.</li>
          <li>Add 2-10 movies (search, filter, or randomize) to build your wheel.</li>
          <li>Spin the wheel and let fate decide what to watch!</li>
          <li>Share your result or invite others with a link.</li>
        </ul>
        <div className="mt-6 text-center">
          <button onClick={onClose} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-purple-600 hover:to-pink-600 transition-all">Got it!</button>
        </div>
      </div>
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import { Film, Users, Sparkles, Popcorn, Zap, PartyPopper, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentTheme } from '../lib/themes';
import { useMousePosition } from '../hooks/useMousePosition';
import { soundManager } from '../lib/sounds';
import PopcornRain from '../components/PopcornRain';
import ClickExplosion from '../components/ClickExplosion';

export default function Home() {
    // Show onboarding modal on first visit
    const [showOnboarding, setShowOnboarding] = useState(false);
    useEffect(() => {
      if (typeof window !== 'undefined' && !localStorage.getItem('popcorn-panic-onboarded')) {
        setShowOnboarding(true);
      }
    }, []);
    const handleCloseOnboarding = () => {
      setShowOnboarding(false);
      localStorage.setItem('popcorn-panic-onboarded', '1');
    };
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const theme = useMemo(() => getCurrentTheme(), []);
  const mouse = useMousePosition();

  // Parallax tilt values (subtle, max ±5 degrees)
  const tiltX = mouse.centerY * -5;
  const tiltY = mouse.centerX * 5;

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    navigate(`/room/${code}`);
  };

  const handleJoinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code) {
      navigate(`/room/${code}`);
    }
  };

  const playHoverSound = () => {
    soundManager.pop();
  };

  return (
    <>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      <main className="min-h-screen relative overflow-hidden">
        {/* Falling Popcorn Rain */}
        <PopcornRain />

        {/* Click Explosion Effect */}
        <ClickExplosion />

        {/* Animated Background Blobs - with parallax */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-10 left-10 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{
              x: mouse.centerX * -20,
              y: mouse.centerY * -20,
            }}
          />
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{
              animationDelay: '1s',
              x: mouse.centerX * -15,
              y: mouse.centerY * -15,
            }}
          />
          <motion.div
            className="absolute bottom-10 left-1/3 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{
            animationDelay: '2s',
            x: mouse.centerX * -25,
            y: mouse.centerY * -25,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"
          style={{
            animationDelay: '3s',
            x: mouse.centerX * -10,
            y: mouse.centerY * -10,
          }}
        />
      </div>

      {/* Main interactive content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        <motion.h1
          className="text-5xl md:text-6xl font-black text-white drop-shadow-2xl text-center mb-6"
          style={{
            textShadow: '4px 4px 0px rgba(255,0,0,0.3), 8px 8px 0px rgba(255,165,0,0.2)',
            letterSpacing: '-0.02em',
            rotateX: tiltX * 0.5,
            rotateY: tiltY * 0.5,
            transformStyle: 'preserve-3d',
          }}
        >
          POPCORN<br />
          <span className="text-yellow-200">PANIC!</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl text-white font-bold max-w-3xl mx-auto drop-shadow-lg mb-4 text-center"
        >
          🍿 Can't pick a movie? <span className="text-yellow-200">SPIN IT!</span> 🎬
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-white/90 font-semibold text-center mb-8"
        >
          The ultimate movie night decision maker!
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateRoom}
          onMouseEnter={playHoverSound}
          className="w-full group relative overflow-hidden bg-white text-red-600 py-6 px-8 rounded-2xl font-black text-2xl shadow-2xl transition-all mb-4"
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 -5px 0 rgba(0,0,0,0.1)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative flex items-center justify-center gap-3">
            <Users className="w-8 h-8" />
            START THE PARTY! 🎉
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/solo')}
          onMouseEnter={playHoverSound}
          className="w-full bg-purple-500/30 hover:bg-purple-500/50 border-2 border-purple-400/50 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mb-8"
        >
          <User className="w-5 h-5" />
          Solo Mode - Just Me 🎲
        </motion.button>

        <div className="relative w-full mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-4 border-white/30 border-dashed"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-6 py-2 bg-red-600/80 backdrop-blur-sm text-white font-bold rounded-full text-lg shadow-lg">
              OR JOIN THE FUN
            </span>
          </div>
        </div>

        <motion.div
          className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-2 border-white/30 w-full mb-8"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-white font-bold text-lg mb-4 text-center">Got a room code? 🎫</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Enter code"
              maxLength={8}
              className="flex-1 bg-white/20 border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 font-mono font-bold text-center text-lg uppercase focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinRoom}
              onMouseEnter={playHoverSound}
              disabled={!joinCode.trim()}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-black px-6 py-3 rounded-xl transition-colors"
            >
              JOIN
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border-2 border-white/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              onMouseEnter={playHoverSound}
            >
              <Film className="w-6 h-6 text-yellow-300" />
              <span className="font-bold">Pick Movies</span>
            </motion.div>
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-bounce"></div>
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border-2 border-white/30"
              whileHover={{ scale: 1.1, rotate: -5 }}
              onMouseEnter={playHoverSound}
            >
              <Users className="w-6 h-6 text-pink-300" />
              <span className="font-bold">Vote Together</span>
            </motion.div>
            <div className="w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <motion.div
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border-2 border-white/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              onMouseEnter={playHoverSound}
            >
              <Sparkles className="w-6 h-6 text-cyan-300" />
              <span className="font-bold">SPIN IT!</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Seasonal Badge */}
        {theme.id !== 'default' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl"
            >
              {theme.emoji}
            </motion.span>
            <span className="text-sm font-bold text-white/80">{theme.name} Edition</span>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-white/70 text-sm font-semibold text-center"
        >
          Made with 🧡 for movie nights that can't decide
        </motion.p>

        {/* Click anywhere hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ delay: 2, duration: 3, repeat: Infinity }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium"
        >
          Click anywhere for popcorn!
        </motion.p>
      </div>
    </main>
  </>);
}
