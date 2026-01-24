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
import { getCurrentTheme } from '@/lib/themes';
import { useMousePosition } from '@/hooks/useMousePosition';
import { soundManager } from '@/lib/sounds';
import PopcornRain from '@/components/PopcornRain';
import ClickExplosion from '@/components/ClickExplosion';

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
    </main>
  </>);
}
