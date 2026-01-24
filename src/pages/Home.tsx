import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Users, Sparkles, Popcorn, Zap, PartyPopper, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentTheme } from '@/lib/themes';
import { useMousePosition } from '@/hooks/useMousePosition';
import { soundManager } from '@/lib/sounds';
import PopcornRain from '@/components/PopcornRain';
import ClickExplosion from '@/components/ClickExplosion';

export default function Home() {
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-8"
          style={{
            perspective: '1000px',
          }}
        >
          {/* Logo with parallax tilt */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6 relative"
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative">
              <Popcorn className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={1.5} />
              <Sparkles className="w-12 h-12 text-yellow-300 absolute -top-4 -right-4 animate-pulse" />
              <Zap className="w-10 h-10 text-red-300 absolute -bottom-2 -left-2 animate-bounce" />
              <PartyPopper className="w-10 h-10 text-pink-300 absolute top-0 -right-8 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </motion.div>

          {/* Title with parallax tilt */}
          <motion.h1
            className="text-7xl md:text-8xl font-black mb-6 text-white drop-shadow-2xl"
            style={{
              textShadow: '4px 4px 0px rgba(255,0,0,0.3), 8px 8px 0px rgba(255,165,0,0.2)',
              letterSpacing: '-0.02em',
              rotateX: tiltX * 0.5,
              rotateY: tiltY * 0.5,
              transformStyle: 'preserve-3d',
            }}
          >
            POPCORN
            <br />
            <span className="text-yellow-200">PANIC!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl text-white font-bold max-w-3xl mx-auto drop-shadow-lg mb-4"
          >
            🍿 Can't pick a movie? <span className="text-yellow-200">SPIN IT!</span> 🎬
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 font-semibold"
          >
            The ultimate movie night decision maker!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md space-y-5"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateRoom}
            onMouseEnter={playHoverSound}
            className="w-full group relative overflow-hidden bg-white text-red-600 py-6 px-8 rounded-2xl font-black text-2xl shadow-2xl transition-all"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 -5px 0 rgba(0,0,0,0.1)'
            }}
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
            className="w-full bg-purple-500/30 hover:bg-purple-500/50 border-2 border-purple-400/50 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Solo Mode - Just Me 🎲
          </motion.button>

          <div className="relative">
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
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border-2 border-white/30"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
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
          className="mt-4 text-white/70 text-sm font-semibold"
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
  );
}
