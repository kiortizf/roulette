import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS, Achievement, getAchievements } from '@/lib/achievements';

interface AchievementsPanelProps {
  onClose?: () => void;
}

export default function AchievementsPanel({ onClose }: AchievementsPanelProps) {
  const userAchievements = getAchievements();
  const unlockedIds = new Set(Object.keys(userAchievements.unlocked));

  const categories = [
    { id: 'spinning', label: 'Spinning', emoji: '🎰' },
    { id: 'winning', label: 'Winning', emoji: '🏆' },
    { id: 'genres', label: 'Genres', emoji: '🎬' },
    { id: 'social', label: 'Social', emoji: '👥' },
    { id: 'special', label: 'Special', emoji: '✨' },
  ];

  const unlockedCount = unlockedIds.size;
  const totalVisible = ACHIEVEMENTS.filter(a => !a.secret).length;
  const progress = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="glass-dark rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold">Achievements</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-yellow-400">{unlockedCount}/{totalVisible}</p>
          <p className="text-xs text-gray-400">{progress}% complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-black/30 rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
        />
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-purple-400">{userAchievements.stats.totalSpins}</p>
          <p className="text-xs text-gray-400">Spins</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-400">{userAchievements.stats.totalWins}</p>
          <p className="text-xs text-gray-400">Wins</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-orange-400">{userAchievements.stats.maxStreak}</p>
          <p className="text-xs text-gray-400">Best Streak</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-400">{unlockedCount}</p>
          <p className="text-xs text-gray-400">Badges</p>
        </div>
      </div>

      {/* Achievements by category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryAchievements = ACHIEVEMENTS.filter(
            a => a.category === category.id && !a.secret
          );
          const secretAchievements = ACHIEVEMENTS.filter(
            a => a.category === category.id && a.secret && unlockedIds.has(a.id)
          );
          const allCategoryAchievements = [...categoryAchievements, ...secretAchievements];

          if (allCategoryAchievements.length === 0) return null;

          return (
            <div key={category.id}>
              <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                <span>{category.emoji}</span>
                {category.label}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allCategoryAchievements.map((achievement, index) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative rounded-xl p-3 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                          : 'bg-black/30 border border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-2xl ${!isUnlocked && 'grayscale opacity-30'}`}>
                          {achievement.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${
                            isUnlocked ? 'text-white' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </p>
                          <p className={`text-xs truncate ${
                            isUnlocked ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {!isUnlocked && (
                          <Lock className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        )}
                      </div>
                      {isUnlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret achievements hint */}
      {ACHIEVEMENTS.filter(a => a.secret && !unlockedIds.has(a.id)).length > 0 && (
        <p className="text-center text-gray-500 text-xs mt-6">
          + {ACHIEVEMENTS.filter(a => a.secret && !unlockedIds.has(a.id)).length} secret achievements to discover...
        </p>
      )}
    </div>
  );
}

// Achievement unlock notification component
export function AchievementUnlockToast({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <motion.span
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-4xl"
        >
          {achievement.emoji}
        </motion.span>
        <div>
          <p className="text-xs font-bold text-yellow-100 uppercase">Achievement Unlocked!</p>
          <p className="font-black text-white text-lg">{achievement.title}</p>
          <p className="text-sm text-yellow-100">{achievement.description}</p>
        </div>
        <Trophy className="w-8 h-8 text-yellow-200" />
      </div>
    </motion.div>
  );
}
