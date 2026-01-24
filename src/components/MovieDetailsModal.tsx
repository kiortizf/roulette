'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Play, ExternalLink, Star, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/types';
import { tmdbApi, getPosterUrl, getBackdropUrl, getProfileUrl } from '@/lib/tmdb';

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieDetailsModal({ movie, onClose }: MovieDetailsModalProps) {
  const { data: details } = useQuery({
    queryKey: ['movie-details', movie.id],
    queryFn: () => tmdbApi.getMovieDetails(movie.id),
  });

  const { data: videos } = useQuery({
    queryKey: ['movie-videos', movie.id],
    queryFn: () => tmdbApi.getVideos(movie.id),
  });

  const { data: credits } = useQuery({
    queryKey: ['movie-credits', movie.id],
    queryFn: () => tmdbApi.getCredits(movie.id),
  });

  const { data: watchProviders } = useQuery({
    queryKey: ['watch-providers', movie.id],
    queryFn: () => tmdbApi.getWatchProviders(movie.id),
  });

  const trailer = videos?.results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  const usProviders = watchProviders?.results?.US;
  const topCast = credits?.cast.slice(0, 8) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Backdrop */}
          <div className="relative h-96">
            {movie.backdrop_path ? (
              <Image
                src={getBackdropUrl(movie.backdrop_path, 'w1280')}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end gap-6">
                {/* Poster */}
                <div className="relative w-48 h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl hidden md:block">
                  {movie.poster_path ? (
                    <Image
                      src={getPosterUrl(movie.poster_path, 'w500')}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">
                      🎬
                    </div>
                  )}
                </div>

                {/* Title and Basic Info */}
                <div className="flex-1 pb-4">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                  {details?.tagline && (
                    <p className="text-xl text-gray-300 italic mb-4">{details.tagline}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      {new Date(movie.release_date).getFullYear()}
                    </div>

                    {details?.runtime && (
                      <div className="flex items-center gap-1 text-gray-300">
                        <Clock className="w-4 h-4" />
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </div>
                    )}

                    {details?.genres && (
                      <div className="flex flex-wrap gap-2">
                        {details.genres.slice(0, 3).map(genre => (
                          <span
                            key={genre.id}
                            className="px-2 py-1 bg-white/10 rounded text-gray-300 text-xs"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Watch Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            {/* Watch Providers */}
            {usProviders && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Where to Watch (US)</h2>
                <div className="space-y-4">
                  {usProviders.flatrate && usProviders.flatrate.length > 0 && (
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Streaming</h3>
                      <div className="flex flex-wrap gap-3">
                        {usProviders.flatrate.map(provider => (
                          <div
                            key={provider.provider_id}
                            className="relative w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white/20"
                            title={provider.provider_name}
                          >
                            <Image
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {usProviders.rent && usProviders.rent.length > 0 && (
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">Rent</h3>
                      <div className="flex flex-wrap gap-3">
                        {usProviders.rent.slice(0, 6).map(provider => (
                          <div
                            key={provider.provider_id}
                            className="relative w-12 h-12 rounded-lg overflow-hidden ring-2 ring-white/20"
                            title={provider.provider_name}
                          >
                            <Image
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {usProviders.link && (
                    <a
                      href={usProviders.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      View all options
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Cast */}
            {topCast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {topCast.map(person => (
                    <div key={person.id} className="text-center">
                      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-800">
                        {person.profile_path ? (
                          <Image
                            src={getProfileUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            👤
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {details && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                {details.status && (
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="font-medium">{details.status}</p>
                  </div>
                )}
                {details.budget > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="font-medium">${(details.budget / 1000000).toFixed(0)}M</p>
                  </div>
                )}
                {details.revenue > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Revenue</p>
                    <p className="font-medium">${(details.revenue / 1000000).toFixed(0)}M</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Votes</p>
                  <p className="font-medium">{movie.vote_count.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
