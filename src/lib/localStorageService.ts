import { Movie } from './types';

// Local storage fallback when Firebase is not configured
interface LocalRoom {
  code: string;
  users: { [userId: string]: any };
  isSpinning: boolean;
  selectedWinner: Movie | null;
  createdAt: number;
}

const LOCAL_ROOMS_KEY = 'movie-roulette-rooms';
const LOCAL_HISTORY_KEY = 'movie-roulette-history';

class LocalStorageService {
  private rooms: Map<string, LocalRoom> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(LOCAL_ROOMS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.rooms = new Map(Object.entries(parsed));
      } catch (e) {
        console.error('Failed to load local rooms:', e);
      }
    }
  }

  private saveToStorage() {
    const obj = Object.fromEntries(this.rooms);
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(obj));
  }

  private notifyListeners(roomCode: string) {
    const listeners = this.listeners.get(roomCode);
    const room = this.rooms.get(roomCode);
    if (listeners && room) {
      listeners.forEach(callback => callback(room));
    }
  }

  createRoom(roomCode: string, user: any) {
    const room: LocalRoom = {
      code: roomCode,
      users: { [user.id]: user },
      isSpinning: false,
      selectedWinner: null,
      createdAt: Date.now(),
    };
    this.rooms.set(roomCode, room);
    this.saveToStorage();
    return Promise.resolve();
  }

  joinRoom(roomCode: string, user: any) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.users[user.id] = user;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  leaveRoom(roomCode: string, userId: string) {
    const room = this.rooms.get(roomCode);
    if (room) {
      delete room.users[userId];
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  subscribeToRoom(roomCode: string, callback: (data: any) => void) {
    if (!this.listeners.has(roomCode)) {
      this.listeners.set(roomCode, new Set());
    }
    this.listeners.get(roomCode)!.add(callback);

    // Immediately call with current data
    const room = this.rooms.get(roomCode);
    if (room) {
      callback(room);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(roomCode);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  updateUserMovies(roomCode: string, userId: string, movies: Movie[]) {
    const room = this.rooms.get(roomCode);
    if (room && room.users[userId]) {
      room.users[userId].selectedMovies = movies;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  toggleUserReady(roomCode: string, userId: string, isReady: boolean) {
    const room = this.rooms.get(roomCode);
    if (room && room.users[userId]) {
      room.users[userId].isReady = isReady;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  setRoomSpinning(roomCode: string, isSpinning: boolean) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.isSpinning = isSpinning;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  setRoomWinner(roomCode: string, movie: Movie) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.selectedWinner = movie;
      this.saveToStorage();
      this.notifyListeners(roomCode);
      
      // Save to history
      this.saveToHistory(roomCode, movie, Object.values(room.users).map(u => u.name));
    }
    return Promise.resolve();
  }

  resetRoom(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (room) {
      Object.values(room.users).forEach((user: any) => {
        user.selectedMovies = [];
        user.isReady = false;
        user.votes = {};
      });
      room.isSpinning = false;
      room.selectedWinner = null;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  voteOnMovie(roomCode: string, userId: string, movieId: string, vote: number) {
    const room = this.rooms.get(roomCode);
    if (room && room.users[userId]) {
      if (!room.users[userId].votes) {
        room.users[userId].votes = {};
      }
      room.users[userId].votes[movieId] = vote;
      this.saveToStorage();
      this.notifyListeners(roomCode);
    }
    return Promise.resolve();
  }

  roomExists(roomCode: string) {
    return Promise.resolve(this.rooms.has(roomCode));
  }

  private saveToHistory(roomCode: string, winner: Movie, participants: string[]) {
    const history = this.getHistory();
    history.unshift({
      winner,
      timestamp: Date.now(),
      roomCode,
      participants,
    });
    // Keep last 50 sessions
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  }

  private getHistory() {
    const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  getUserHistory() {
    return Promise.resolve(this.getHistory());
  }

  getRoomHistory(roomCode: string) {
    return Promise.resolve(this.getHistory().filter((h: any) => h.roomCode === roomCode));
  }

  cleanupInactiveUsers() {
    // No-op for local storage
    return Promise.resolve();
  }
}

export const localStorageService = new LocalStorageService();
