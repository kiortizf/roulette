import { motion } from 'framer-motion';
import { Users, Check, Loader2, Popcorn } from 'lucide-react';
import { RoomUser } from '@/lib/firebaseService';

interface UserListProps {
  users: RoomUser[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const readyCount = users.filter(u => u.isReady).length;
  const allReady = readyCount === users.length && users.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-md rounded-3xl p-5 border-2 border-indigo-400/30"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          🎭
        </motion.div>
        <div>
          <h3 className="text-lg font-black text-white">THE CREW</h3>
          <p className="text-xs text-indigo-300">{users.length} movie picker{users.length !== 1 ? 's' : ''} in the party</p>
        </div>
      </div>

      <div className="space-y-2">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const movieCount = user.selectedMovies?.length || 0;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400/50'
                  : 'bg-black/30 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg"
                  style={{ backgroundColor: user.color }}
                  animate={user.isReady ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {user.isReady ? '✓' : user.name[0].toUpperCase()}
                </motion.div>
                <div>
                  <p className="font-bold text-white flex items-center gap-2">
                    {user.name}
                    {isCurrentUser && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">YOU</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Popcorn className="w-3 h-3" />
                    <span>{movieCount} movie{movieCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {user.isReady ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    READY!
                  </motion.div>
                ) : movieCount > 0 ? (
                  <motion.div
                    className="flex items-center gap-1 bg-yellow-500/80 text-black px-3 py-1.5 rounded-full font-bold text-xs"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PICKING
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-1 bg-gray-600/50 text-gray-300 px-3 py-1.5 rounded-full font-medium text-xs">
                    <span>💭</span>
                    THINKING
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ready Status Bar */}
      <div className="mt-4 pt-4 border-t border-indigo-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-indigo-300 font-medium text-sm">Ready to spin:</span>
          <span className={`font-black text-lg ${allReady ? 'text-green-400' : 'text-yellow-400'}`}>
            {readyCount} / {users.length}
          </span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${allReady ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${users.length > 0 ? (readyCount / users.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {allReady && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-green-400 font-bold text-sm mt-2"
          >
            🎉 EVERYONE'S READY! SPIN IT! 🎉
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
