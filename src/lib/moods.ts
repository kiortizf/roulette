export interface MoodPreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  genres: number[];
  minRating?: number;
  maxRating?: number;
}

// TMDB Genre IDs
// Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
// Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
// Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, Science Fiction: 878,
// TV Movie: 10770, Thriller: 53, War: 10752, Western: 37

export const MOOD_PRESETS: MoodPreset[] = [
  {
    id: 'light',
    label: 'Something Light',
    emoji: '😌',
    description: 'Easy-going comedies and feel-good movies',
    genres: [35, 10751], // Comedy, Family
    minRating: 6.5,
  },
  {
    id: 'cry',
    label: 'Make Me Cry',
    emoji: '😢',
    description: 'Emotional dramas and tearjerkers',
    genres: [18, 10749], // Drama, Romance
    minRating: 7,
  },
  {
    id: 'adrenaline',
    label: 'Adrenaline Rush',
    emoji: '🔥',
    description: 'Action-packed thrillers',
    genres: [28, 53], // Action, Thriller
    minRating: 7,
  },
  {
    id: 'cozy',
    label: 'Cozy Night',
    emoji: '🛋️',
    description: 'Animated films and family favorites',
    genres: [16, 10751], // Animation, Family
    minRating: 6.5,
  },
  {
    id: 'mindbending',
    label: 'Mind-Bending',
    emoji: '🧠',
    description: 'Sci-fi mysteries that make you think',
    genres: [878, 9648], // Science Fiction, Mystery
    minRating: 7,
  },
  {
    id: 'datenight',
    label: 'Date Night',
    emoji: '💕',
    description: 'Romantic comedies for two',
    genres: [10749, 35], // Romance, Comedy
    minRating: 6.5,
  },
  {
    id: 'scary',
    label: 'Scary Night',
    emoji: '👻',
    description: 'Horror and suspense',
    genres: [27, 53], // Horror, Thriller
    minRating: 6,
  },
  {
    id: 'feelgood',
    label: 'Feel Good',
    emoji: '✨',
    description: 'Uplifting stories with happy endings',
    genres: [35, 10402, 10751], // Comedy, Music, Family
    minRating: 7,
  },
  {
    id: 'epic',
    label: 'Epic Adventure',
    emoji: '⚔️',
    description: 'Grand adventures and fantasy',
    genres: [12, 14], // Adventure, Fantasy
    minRating: 7,
  },
  {
    id: 'classic',
    label: 'Classic Vibes',
    emoji: '🎞️',
    description: 'Highly rated gems from the past',
    genres: [], // Any genre
    minRating: 8,
  },
];
