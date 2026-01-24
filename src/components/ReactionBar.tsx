import { motion } from 'framer-motion';
import { sendReaction } from '../lib/firebaseService';
import { soundManager, haptic } from '../lib/sounds';

interface ReactionBarProps {
  roomCode: string;
  userId: string;
  userName: string;
  userColor: string;
}

const REACTIONS = ['❤️', '🔥', '😂', '😍', '👏', '🎉', '👀', '💀'];

export default function ReactionBar({
  roomCode,
  userId,
  userName,
  userColor,
}: ReactionBarProps) {
  const handleReaction = async (emoji: string) => {
    soundManager.pop();
    haptic.light();
    await sendReaction(roomCode, userId, userName, userColor, emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 safe-bottom px-4 w-full max-w-lg"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex gap-1 sm:gap-2 bg-black/60 backdrop-blur-md rounded-full px-2 sm:px-4 py-2 border border-white/20 justify-center">
        {REACTIONS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleReaction(emoji)}
            className="text-xl sm:text-2xl p-2 sm:p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-target"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
