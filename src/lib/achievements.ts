// Achievements system for Popcorn Panic

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'spinning' | 'winning' | 'genres' | 'social' | 'special';
  requirement: number;
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Spinning achievements
  { id: 'first_spin', title: 'First Spin', description: 'Spin the wheel for the first time', emoji: '🎰', category: 'spinning', requirement: 1 },
  { id: 'spin_5', title: 'Getting Started', description: 'Spin the wheel 5 times', emoji: '🔄', category: 'spinning', requirement: 5 },
  { id: 'spin_10', title: 'Regular Spinner', description: 'Spin the wheel 10 times', emoji: '🎡', category: 'spinning', requirement: 10 },
  { id: 'spin_25', title: 'Wheel Enthusiast', description: 'Spin the wheel 25 times', emoji: '🌀', category: 'spinning', requirement: 25 },
  { id: 'spin_50', title: 'Spin Master', description: 'Spin the wheel 50 times', emoji: '💫', category: 'spinning', requirement: 50 },
  { id: 'spin_100', title: 'Wheel Legend', description: 'Spin the wheel 100 times', emoji: '👑', category: 'spinning', requirement: 100 },

  // Winning achievements
  { id: 'first_win', title: 'Winner Winner', description: 'Have your movie picked', emoji: '🏆', category: 'winning', requirement: 1 },
  { id: 'win_5', title: 'Lucky Picker', description: 'Win 5 times', emoji: '🍀', category: 'winning', requirement: 5 },
  { id: 'win_10', title: 'Movie Maestro', description: 'Win 10 times', emoji: '🎬', category: 'winning', requirement: 10 },
  { id: 'win_25', title: 'Taste Maker', description: 'Win 25 times', emoji: '⭐', category: 'winning', requirement: 25 },

  // Streak achievements
  { id: 'streak_2', title: 'Double Feature', description: 'Win 2 times in a row', emoji: '🔥', category: 'winning', requirement: 2 },
  { id: 'streak_3', title: 'Hat Trick', description: 'Win 3 times in a row', emoji: '🎩', category: 'winning', requirement: 3 },
  { id: 'streak_5', title: 'Unstoppable', description: 'Win 5 times in a row', emoji: '🔥🔥', category: 'winning', requirement: 5 },

  // Genre achievements
  { id: 'genre_action', title: 'Action Hero', description: 'Pick 5 action movies', emoji: '💥', category: 'genres', requirement: 5 },
  { id: 'genre_comedy', title: 'Funny Bone', description: 'Pick 5 comedies', emoji: '😂', category: 'genres', requirement: 5 },
  { id: 'genre_horror', title: 'Scream Queen', description: 'Pick 5 horror movies', emoji: '👻', category: 'genres', requirement: 5 },
  { id: 'genre_romance', title: 'Hopeless Romantic', description: 'Pick 5 romances', emoji: '💕', category: 'genres', requirement: 5 },
  { id: 'genre_scifi', title: 'Space Cadet', description: 'Pick 5 sci-fi movies', emoji: '🚀', category: 'genres', requirement: 5 },

  // Social achievements
  { id: 'party_3', title: 'Party Starter', description: 'Have 3 people in a room', emoji: '🎉', category: 'social', requirement: 3 },
  { id: 'party_5', title: 'Full House', description: 'Have 5 people in a room', emoji: '🏠', category: 'social', requirement: 5 },

  // Special achievements
  { id: 'night_owl', title: 'Night Owl', description: 'Spin after midnight', emoji: '🦉', category: 'special', requirement: 1, secret: true },
  { id: 'early_bird', title: 'Early Bird', description: 'Spin before 7am', emoji: '🐦', category: 'special', requirement: 1, secret: true },
  { id: 'perfect_10', title: 'Perfect 10', description: 'Pick a movie rated 9.0+', emoji: '💯', category: 'special', requirement: 1 },
  { id: 'classic', title: 'Classic Connoisseur', description: 'Pick a movie from before 1980', emoji: '🎞️', category: 'special', requirement: 1 },
];

// Storage key for achievements
const ACHIEVEMENTS_KEY = 'popcorn_panic_achievements';

export interface UserAchievements {
  unlocked: { [achievementId: string]: number }; // timestamp when unlocked
  stats: {
    totalSpins: number;
    totalWins: number;
    currentStreak: number;
    maxStreak: number;
    genreCounts: { [genreId: string]: number };
  };
}

const defaultAchievements: UserAchievements = {
  unlocked: {},
  stats: {
    totalSpins: 0,
    totalWins: 0,
    currentStreak: 0,
    maxStreak: 0,
    genreCounts: {},
  },
};

export function getAchievements(): UserAchievements {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      return { ...defaultAchievements, ...JSON.parse(stored) };
    }
  } catch {
    // localStorage might not be available
  }
  return { ...defaultAchievements };
}

export function saveAchievements(achievements: UserAchievements): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch {
    // localStorage might not be available
  }
}

export function checkAndUnlockAchievements(
  currentAchievements: UserAchievements,
  context: {
    justSpun?: boolean;
    justWon?: boolean;
    isStreak?: boolean;
    streakCount?: number;
    usersInRoom?: number;
    movieRating?: number;
    movieYear?: number;
    movieGenres?: number[];
  }
): { achievements: UserAchievements; newUnlocks: Achievement[] } {
  const achievements = { ...currentAchievements };
  const newUnlocks: Achievement[] = [];

  const unlock = (achievement: Achievement) => {
    if (!achievements.unlocked[achievement.id]) {
      achievements.unlocked[achievement.id] = Date.now();
      newUnlocks.push(achievement);
    }
  };

  // Update stats
  if (context.justSpun) {
    achievements.stats.totalSpins++;
  }
  if (context.justWon) {
    achievements.stats.totalWins++;
    achievements.stats.currentStreak++;
    achievements.stats.maxStreak = Math.max(
      achievements.stats.maxStreak,
      achievements.stats.currentStreak
    );
  } else if (context.justSpun && !context.justWon) {
    achievements.stats.currentStreak = 0;
  }

  // Track genres
  if (context.movieGenres) {
    context.movieGenres.forEach(genreId => {
      achievements.stats.genreCounts[genreId] = (achievements.stats.genreCounts[genreId] || 0) + 1;
    });
  }

  // Check spinning achievements
  const spins = achievements.stats.totalSpins;
  if (spins >= 1) unlock(ACHIEVEMENTS.find(a => a.id === 'first_spin')!);
  if (spins >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'spin_5')!);
  if (spins >= 10) unlock(ACHIEVEMENTS.find(a => a.id === 'spin_10')!);
  if (spins >= 25) unlock(ACHIEVEMENTS.find(a => a.id === 'spin_25')!);
  if (spins >= 50) unlock(ACHIEVEMENTS.find(a => a.id === 'spin_50')!);
  if (spins >= 100) unlock(ACHIEVEMENTS.find(a => a.id === 'spin_100')!);

  // Check winning achievements
  const wins = achievements.stats.totalWins;
  if (wins >= 1) unlock(ACHIEVEMENTS.find(a => a.id === 'first_win')!);
  if (wins >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'win_5')!);
  if (wins >= 10) unlock(ACHIEVEMENTS.find(a => a.id === 'win_10')!);
  if (wins >= 25) unlock(ACHIEVEMENTS.find(a => a.id === 'win_25')!);

  // Check streak achievements
  const streak = achievements.stats.currentStreak;
  if (streak >= 2) unlock(ACHIEVEMENTS.find(a => a.id === 'streak_2')!);
  if (streak >= 3) unlock(ACHIEVEMENTS.find(a => a.id === 'streak_3')!);
  if (streak >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'streak_5')!);

  // Check genre achievements
  const genreCounts = achievements.stats.genreCounts;
  if ((genreCounts['28'] || 0) >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'genre_action')!);
  if ((genreCounts['35'] || 0) >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'genre_comedy')!);
  if ((genreCounts['27'] || 0) >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'genre_horror')!);
  if ((genreCounts['10749'] || 0) >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'genre_romance')!);
  if ((genreCounts['878'] || 0) >= 5) unlock(ACHIEVEMENTS.find(a => a.id === 'genre_scifi')!);

  // Check social achievements
  if (context.usersInRoom && context.usersInRoom >= 3) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'party_3')!);
  }
  if (context.usersInRoom && context.usersInRoom >= 5) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'party_5')!);
  }

  // Check special achievements
  const hour = new Date().getHours();
  if (context.justSpun && hour >= 0 && hour < 5) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'night_owl')!);
  }
  if (context.justSpun && hour >= 5 && hour < 7) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'early_bird')!);
  }
  if (context.movieRating && context.movieRating >= 9.0) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'perfect_10')!);
  }
  if (context.movieYear && context.movieYear < 1980) {
    unlock(ACHIEVEMENTS.find(a => a.id === 'classic')!);
  }

  return { achievements, newUnlocks };
}

export function getUnlockedCount(): number {
  const achievements = getAchievements();
  return Object.keys(achievements.unlocked).length;
}

export function getTotalCount(): number {
  return ACHIEVEMENTS.filter(a => !a.secret).length;
}
