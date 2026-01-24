'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

import { Movie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';
import { useState } from 'react';

interface VotingMovieCardProps {
  movie: Movie;
  userVote?: number; // -1, 0, or 1
  totalVotes: number;
  onVote: (movieId: number, vote: number) => void;
  onRemove?: (movieId: number) => void;
  isOwnMovie?: boolean;
}

export default function VotingMovieCard({ 
  movie, 
  userVote = 0, 
  totalVotes,
  onVote,
  onRemove,
  isOwnMovie = false,
}: VotingMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleVote = (vote: number) => {
    // Toggle vote if clicking same button
    const newVote = userVote === vote ? 0 : vote;
    onVote(movie.id, newVote);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={getPosterUrl(movie.poster_path, 'w342')}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">
            🎬
          </div>
        )}

        {/* Overlay with info */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-semibold text-sm line-clamp-2 mb-2">
              {movie.title}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Vote indicator */}
        {totalVotes !== 0 && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
            totalVotes > 0 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {totalVotes > 0 ? '+' : ''}{totalVotes}
          </div>
        )}

        {isOwnMovie && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
            Your pick
          </div>
        )}
      </div>

      {/* Voting buttons */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => handleVote(1)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-medium transition-all ${
            userVote === 1
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">Up</span>
        </button>
        <button
          onClick={() => handleVote(-1)}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-medium transition-all ${
            userVote === -1
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-xs">Down</span>
        </button>
      </div>
    </motion.div>
  );
}
