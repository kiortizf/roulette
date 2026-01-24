import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reaction, subscribeToReactions } from '@/lib/firebaseService';

interface FloatingReactionsProps {
  roomCode: string;
}

interface DisplayReaction extends Reaction {
  x: number;
}

export default function FloatingReactions({ roomCode }: FloatingReactionsProps) {
  const [displayReactions, setDisplayReactions] = useState<DisplayReaction[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToReactions(roomCode, (reactions) => {
      // Add random x position to each reaction
      const newReactions = reactions.map((r) => ({
        ...r,
        x: 10 + Math.random() * 80, // 10-90% from left
      }));

      setDisplayReactions((prev) => {
        // Merge with existing, avoiding duplicates
        const existingIds = new Set(prev.map((r) => r.id));
        const uniqueNew = newReactions.filter((r) => !existingIds.has(r.id));
        return [...prev, ...uniqueNew].slice(-20); // Keep last 20
      });
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Remove reactions after animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayReactions((prev) =>
        prev.filter((r) => Date.now() - r.timestamp < 4000)
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {displayReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: '100vh', scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: ['100vh', '60vh', '30vh', '-10vh'],
              scale: [0.5, 1.2, 1, 0.8],
              x: [0, Math.random() > 0.5 ? 20 : -20, Math.random() > 0.5 ? -20 : 20, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            className="absolute text-5xl"
            style={{ left: `${reaction.x}%` }}
          >
            <div className="relative">
              {reaction.emoji}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: reaction.userColor }}
              >
                {reaction.userName}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
