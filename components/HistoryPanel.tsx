'use client';

import { motion } from 'framer-motion';
import { Clock, Users as UsersIcon } from 'lucide-react';
import Image from 'next/image';
import { SessionHistory } from '@/lib/firebaseService';
import { getPosterUrl } from '@/lib/tmdb';

interface HistoryPanelProps {
  history: SessionHistory[];
  onMovieClick?: (movieId: number) => void;
}

export default function HistoryPanel({ history, onMovieClick }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="glass-dark rounded-2xl p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400">No watch history yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Movies you've watched will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Watch History</h3>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {history.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-black/30 rounded-xl p-4 hover:bg-black/50 transition-colors cursor-pointer"
            onClick={() => onMovieClick?.(session.winner.id)}
          >
            <div className="flex gap-3">
              {/* Movie Poster */}
              <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                {session.winner.poster_path ? (
                  <Image
                    src={getPosterUrl(session.winner.poster_path, 'w185')}
                    alt={session.winner.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs">
                    🎬
                  </div>
                )}
              </div>

              {/* Movie Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate mb-1">
                  {session.winner.title}
                </h4>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span className="text-yellow-400">
                    ⭐ {session.winner.vote_average.toFixed(1)}
                  </span>
                  <span>
                    {new Date(session.winner.release_date).getFullYear()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    <span>{session.participants.length} viewer{session.participants.length > 1 ? 's' : ''}</span>
                  </div>
                  <span>
                    {new Date(session.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Vote score */}
                {session.votes && session.votes[session.winner.id] && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.votes[session.winner.id] > 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {session.votes[session.winner.id] > 0 ? '+' : ''}{session.votes[session.winner.id]} votes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
