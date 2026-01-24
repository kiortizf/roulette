import { motion } from 'framer-motion';
import { Trophy, Flame, Film, TrendingUp, BarChart3 } from 'lucide-react';
import { RoomStats } from '@/lib/types';
import { MOVIE_GENRES } from '@/lib/genres';
import { RoomUser } from '@/lib/firebaseService';

interface StatsPanelProps {
  stats: RoomStats | undefined;
  users: RoomUser[];
}

export default function StatsPanel({ stats, users }: StatsPanelProps) {
  if (!stats || stats.totalSpins === 0) {
    return (
      <div className="glass-dark rounded-2xl p-8 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400">No stats yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Spin the wheel to start tracking!
        </p>
      </div>
    );
  }

  // Get top genres
  const topGenres = Object.entries(stats.genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genreId, count]) => ({
      name: MOVIE_GENRES[Number(genreId) as keyof typeof MOVIE_GENRES] || 'Unknown',
      count,
    }));

  // Get user with most wins
  const userWinsList = Object.entries(stats.userWins)
    .map(([odUserId, wins]) => {
      const user = users.find(u => u.id === odUserId);
      return {
        odUserId,
        name: user?.name || 'Unknown',
        color: user?.color || '#888',
        wins,
      };
    })
    .sort((a, b) => b.wins - a.wins);

  const topWinner = userWinsList[0];

  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Room Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Spins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center"
        >
          <Film className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <p className="text-3xl font-black text-white">{stats.totalSpins}</p>
          <p className="text-sm text-gray-400">Total Spins</p>
        </motion.div>

        {/* Movies Watched */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 text-center"
        >
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <p className="text-3xl font-black text-white">{stats.moviesWatched}</p>
          <p className="text-sm text-gray-400">Movies Picked</p>
        </motion.div>
      </div>

      {/* Current Streak */}
      {stats.currentStreak && stats.currentStreak.count > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-xl p-4 mb-4 border-2 border-orange-400/50"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Flame className="w-8 h-8 text-orange-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-2xl font-black text-orange-300">
                {stats.currentStreak.count} WIN STREAK!
              </p>
              <p className="text-sm text-orange-200">
                {stats.currentStreak.userName} is on fire!
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
            >
              <Flame className="w-8 h-8 text-orange-400" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Top Winner */}
      {topWinner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Most Wins</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: topWinner.color }}
                >
                  {topWinner.name[0]}
                </div>
                <span className="font-bold text-white">{topWinner.name}</span>
                <span className="text-yellow-400 font-black">
                  {topWinner.wins} win{topWinner.wins !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Users Wins */}
      {userWinsList.length > 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Leaderboard</p>
          <div className="space-y-2">
            {userWinsList.map((user, index) => (
              <motion.div
                key={user.odUserId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 bg-black/30 rounded-lg p-2"
              >
                <span className="text-lg font-bold text-gray-500 w-6">
                  #{index + 1}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </div>
                <span className="flex-1 font-medium">{user.name}</span>
                <span className="font-bold text-purple-400">
                  {user.wins} win{user.wins !== 1 ? 's' : ''}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top Genres */}
      {topGenres.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-400 mb-2">Favorite Genres</p>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre, index) => (
              <span
                key={genre.name}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  index === 0
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {genre.name} ({genre.count})
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
