// Sound effects manager
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      this.loadSound('spin', '/sounds/spin.mp3');
      this.loadSound('winner', '/sounds/winner.mp3');
      this.loadSound('click', '/sounds/click.mp3');
      this.loadSound('vote', '/sounds/vote.mp3');
    }
  }

  private loadSound(name: string, path: string) {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`);
    }
  }

  play(name: string, volume: number = 1) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();

// Haptic feedback for mobile
export const haptic = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },
};
