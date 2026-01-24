import { motion } from 'framer-motion';
import { Users, Check, Clock } from 'lucide-react';
import { User } from '@/lib/store';

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Participants ({users.length})</h3>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          const movieCount = user.selectedMovies?.length || 0;
          const hasMovies = movieCount > 0;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-xl ${
                isCurrentUser 
                  ? 'bg-purple-500/20 border border-purple-500/50' 
                  : 'bg-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    {user.name}
                    {isCurrentUser && (
                      <span className="text-xs text-purple-400 font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">
                    {movieCount} {movieCount === 1 ? 'movie' : 'movies'} selected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user.isReady ? (
                  <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Ready</span>
                  </div>
                ) : hasMovies ? (
                  <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Picking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Waiting</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ready Status Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Ready to spin:</span>
          <span className="font-semibold text-white">
            {users.filter(u => u.isReady).length} / {users.length}
          </span>
        </div>
      </div>
    </div>
  );
}
