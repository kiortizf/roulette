// Seasonal themes for Popcorn Panic

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accentColor: string;
  floatingEmojis: string[];
}

export const THEMES: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Classic',
    emoji: '🍿',
    gradientFrom: 'from-red-600',
    gradientVia: 'via-orange-500',
    gradientTo: 'to-yellow-500',
    accentColor: 'yellow',
    floatingEmojis: ['🍿', '🎬', '⭐', '🎥'],
  },
  halloween: {
    id: 'halloween',
    name: 'Spooky Season',
    emoji: '🎃',
    gradientFrom: 'from-orange-600',
    gradientVia: 'via-purple-700',
    gradientTo: 'to-black',
    accentColor: 'orange',
    floatingEmojis: ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️'],
  },
  christmas: {
    id: 'christmas',
    name: 'Holiday Magic',
    emoji: '🎄',
    gradientFrom: 'from-red-700',
    gradientVia: 'via-green-700',
    gradientTo: 'to-red-600',
    accentColor: 'green',
    floatingEmojis: ['🎄', '🎅', '⭐', '❄️', '🎁', '🦌'],
  },
  valentines: {
    id: 'valentines',
    name: 'Date Night',
    emoji: '💕',
    gradientFrom: 'from-pink-600',
    gradientVia: 'via-red-500',
    gradientTo: 'to-rose-400',
    accentColor: 'pink',
    floatingEmojis: ['💕', '❤️', '💖', '🌹', '💘', '✨'],
  },
  summer: {
    id: 'summer',
    name: 'Summer Vibes',
    emoji: '🌴',
    gradientFrom: 'from-cyan-500',
    gradientVia: 'via-blue-500',
    gradientTo: 'to-teal-400',
    accentColor: 'cyan',
    floatingEmojis: ['🌴', '🌊', '☀️', '🏖️', '🍹', '🐚'],
  },
  spring: {
    id: 'spring',
    name: 'Spring Bloom',
    emoji: '🌸',
    gradientFrom: 'from-pink-400',
    gradientVia: 'via-purple-400',
    gradientTo: 'to-indigo-400',
    accentColor: 'pink',
    floatingEmojis: ['🌸', '🌷', '🦋', '🌼', '🐝', '🌈'],
  },
  newyear: {
    id: 'newyear',
    name: 'New Year',
    emoji: '🎉',
    gradientFrom: 'from-yellow-400',
    gradientVia: 'via-amber-500',
    gradientTo: 'to-orange-500',
    accentColor: 'yellow',
    floatingEmojis: ['🎉', '🥂', '🎆', '✨', '🎊', '🍾'],
  },
};

// Detect current theme based on date
export function getCurrentTheme(): Theme {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // New Year (Dec 31 - Jan 7)
  if ((month === 11 && day >= 31) || (month === 0 && day <= 7)) {
    return THEMES.newyear;
  }

  // Valentine's Day (Feb 7-14)
  if (month === 1 && day >= 7 && day <= 14) {
    return THEMES.valentines;
  }

  // Halloween (Oct 15 - Oct 31)
  if (month === 9 && day >= 15) {
    return THEMES.halloween;
  }

  // Christmas (Dec 1 - Dec 30)
  if (month === 11 && day >= 1 && day <= 30) {
    return THEMES.christmas;
  }

  // Spring (March - May)
  if (month >= 2 && month <= 4) {
    return THEMES.spring;
  }

  // Summer (June - August)
  if (month >= 5 && month <= 7) {
    return THEMES.summer;
  }

  // Default for fall/other times
  return THEMES.default;
}

// Get theme by ID or current
export function getTheme(themeId?: string): Theme {
  if (themeId && THEMES[themeId]) {
    return THEMES[themeId];
  }
  return getCurrentTheme();
}

// Theme context for CSS variables
export function getThemeStyles(theme: Theme): Record<string, string> {
  return {
    '--theme-gradient': `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
    '--theme-accent': theme.accentColor,
  };
}
