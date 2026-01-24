import { ref, set, update, onValue, remove, push, get } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';
import { localStorageService } from './localStorageService';
import { Movie, RoomStats } from './types';

// Use local storage if Firebase is not configured
const useLocalStorage = !isFirebaseConfigured;

console.log('🔥 Firebase configured:', isFirebaseConfigured);
console.log('🔥 Database object:', database);
console.log('🔥 Using localStorage:', useLocalStorage);

if (useLocalStorage) {
  console.log('🔧 Using local storage mode - set up Firebase for real-time sync across devices');
}

export interface RoomUser {
  id: string;
  name: string;
  color: string;
  selectedMovies: Movie[];
  isReady: boolean;
  votes: { [movieId: string]: number }; // -1 for downvote, 1 for upvote
  lastActive: number;
}

export interface RoomData {
  code: string;
  createdAt: number;
  users: { [userId: string]: RoomUser };
  isSpinning: boolean;
  selectedWinner: Movie | null;
  history: SessionHistory[];
  stats?: RoomStats;
}

export interface SessionHistory {
  id: string;
  timestamp: number;
  winner: Movie;
  participants: string[];
  votes: { [movieId: string]: number };
}

// Create a new room
export const createRoom = async (roomCode: string, user: RoomUser) => {
  console.log('🎬 createRoom called:', { roomCode, userId: user.id, useLocalStorage });
  
  if (useLocalStorage) {
    return localStorageService.createRoom(roomCode, user);
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomCode}`);
    console.log('🎬 Room ref created:', roomRef);
    await set(roomRef, {
      code: roomCode,
      createdAt: Date.now(),
      users: {
        [user.id]: user,
      },
      isSpinning: false,
      selectedWinner: null,
      history: [],
    });
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}
// Join existing room
export const joinRoom = async (roomCode: string, user: RoomUser) => {
  if (useLocalStorage) {
    return localStorageService.joinRoom(roomCode, user);
  }
  const userRef = ref(database, `rooms/${roomCode}/users/${user.id}`);
  await set(userRef, user);
};

// Leave room
export const leaveRoom = async (roomCode: string, userId: string) => {
  if (useLocalStorage) {
    return localStorageService.leaveRoom(roomCode, userId);
  }
  const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
  await remove(userRef);
};

// Update user data
export const updateUser = async (roomCode: string, userId: string, updates: Partial<RoomUser>) => {
  const userRef = ref(database, `rooms/${roomCode}/users/${userId}`);
  await update(userRef, { ...updates, lastActive: Date.now() });
};

// Update user movies
export const updateUserMovies = async (roomCode: string, userId: string, movies: Movie[]) => {
  if (useLocalStorage) {
    return localStorageService.updateUserMovies(roomCode, userId, movies);
  }
  await updateUser(roomCode, userId, { selectedMovies: movies });
};

// Toggle user ready status
export const toggleUserReady = async (roomCode: string, userId: string, isReady: boolean) => {
  if (useLocalStorage) {
    return localStorageService.toggleUserReady(roomCode, userId, isReady);
  }
  await updateUser(roomCode, userId, { isReady });
};

// Vote on a movie
export const voteOnMovie = async (roomCode: string, userId: string, movieId: string, vote: number) => {
  if (useLocalStorage) {
    return localStorageService.voteOnMovie(roomCode, userId, movieId, vote);
  }
  const voteRef = ref(database, `rooms/${roomCode}/users/${userId}/votes/${movieId}`);
  await set(voteRef, vote);
};

// Set spinning state
export const setRoomSpinning = async (roomCode: string, isSpinning: boolean) => {
  if (useLocalStorage) {
    return localStorageService.setRoomSpinning(roomCode, isSpinning);
  }
  const spinRef = ref(database, `rooms/${roomCode}/isSpinning`);
  await set(spinRef, isSpinning);
};

// Set winner and save to history (pass null to clear winner for veto/respin)
export const setRoomWinner = async (roomCode: string, winner: Movie | null) => {
  if (useLocalStorage) {
    return localStorageService.setRoomWinner(roomCode, winner);
  }

  const winnerRef = ref(database, `rooms/${roomCode}/selectedWinner`);
  await set(winnerRef, winner);

  if (winner) {
    // Get room data to save history
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      const roomData = snapshot.val() as RoomData;

      // Calculate total votes for all movies
      const allVotes: { [movieId: string]: number } = {};
      Object.values(roomData.users).forEach(user => {
        if (user.votes) {
          Object.entries(user.votes).forEach(([movieId, vote]) => {
            allVotes[movieId] = (allVotes[movieId] || 0) + vote;
          });
        }
      });

      // Find which user submitted the winning movie
      let winningUserId: string | null = null;
      let winningUserName: string = '';
      Object.entries(roomData.users).forEach(([odUserId, user]) => {
        if (user.selectedMovies?.some(m => m.id === winner.id)) {
          winningUserId = odUserId;
          winningUserName = user.name;
        }
      });

      // Update stats
      const currentStats = roomData.stats || {
        totalSpins: 0,
        moviesWatched: 0,
        userWins: {},
        genreCounts: {},
        currentStreak: null,
      };

      const newStats: RoomStats = {
        totalSpins: currentStats.totalSpins + 1,
        moviesWatched: currentStats.moviesWatched + 1,
        userWins: { ...currentStats.userWins },
        genreCounts: { ...currentStats.genreCounts },
        currentStreak: currentStats.currentStreak,
      };

      // Update winner count
      if (winningUserId) {
        newStats.userWins[winningUserId] = (newStats.userWins[winningUserId] || 0) + 1;

        // Update streak
        if (currentStats.currentStreak?.odUserId === winningUserId) {
          newStats.currentStreak = {
            odUserId: winningUserId,
            userName: winningUserName,
            count: currentStats.currentStreak.count + 1,
          };
        } else {
          newStats.currentStreak = {
            odUserId: winningUserId,
            userName: winningUserName,
            count: 1,
          };
        }
      }

      // Update genre counts
      if (winner.genre_ids) {
        winner.genre_ids.forEach(genreId => {
          newStats.genreCounts[genreId] = (newStats.genreCounts[genreId] || 0) + 1;
        });
      }

      // Save stats
      const statsRef = ref(database, `rooms/${roomCode}/stats`);
      await set(statsRef, newStats);

      // Save to history
      const historyRef = ref(database, `rooms/${roomCode}/history`);
      const newHistoryRef = push(historyRef);
      await set(newHistoryRef, {
        id: newHistoryRef.key,
        timestamp: Date.now(),
        winner,
        participants: Object.keys(roomData.users),
        votes: allVotes,
      });

      // Also save to user's personal history
      Object.keys(roomData.users).forEach(async (odUserId) => {
        const userHistoryRef = ref(database, `userHistory/${odUserId}`);
        const newUserHistoryRef = push(userHistoryRef);
        await set(newUserHistoryRef, {
          id: newUserHistoryRef.key,
          timestamp: Date.now(),
          winner,
          roomCode,
        });
      });
    }
  }
};

// Reset room
export const resetRoom = async (roomCode: string) => {
  if (useLocalStorage) {
    return localStorageService.resetRoom(roomCode);
  }
  
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  
  if (snapshot.exists()) {
    const roomData = snapshot.val() as RoomData;
    const resetUsers: { [userId: string]: RoomUser } = {};
    
    // Reset all users
    Object.entries(roomData.users).forEach(([userId, user]) => {
      resetUsers[userId] = {
        ...user,
        selectedMovies: [],
        isReady: false,
        votes: {},
        lastActive: Date.now(),
      };
    });

    await update(roomRef, {
      users: resetUsers,
      isSpinning: false,
      selectedWinner: null,
    });
  }
};

// Listen to room changes
export const subscribeToRoom = (roomCode: string, callback: (data: RoomData | null) => void) => {
  if (useLocalStorage) {
    return localStorageService.subscribeToRoom(roomCode, callback);
  }
  
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as RoomData);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Get user's watch history
export const getUserHistory = async (userId: string): Promise<SessionHistory[]> => {
  if (useLocalStorage) {
    return localStorageService.getUserHistory();
  }
  
  const historyRef = ref(database, `userHistory/${userId}`);
  const snapshot = await get(historyRef);
  
  if (snapshot.exists()) {
    const historyData = snapshot.val();
    return Object.values(historyData).sort((a: any, b: any) => b.timestamp - a.timestamp) as SessionHistory[];
  }
  
  return [];
};

// Get room history
export const getRoomHistory = async (roomCode: string): Promise<SessionHistory[]> => {
  if (useLocalStorage) {
    return localStorageService.getRoomHistory(roomCode);
  }
  
  const historyRef = ref(database, `rooms/${roomCode}/history`);
  const snapshot = await get(historyRef);
  
  if (snapshot.exists()) {
    const historyData = snapshot.val();
    return Object.values(historyData).sort((a: any, b: any) => b.timestamp - a.timestamp) as SessionHistory[];
  }
  
  return [];
};

// Check if room exists
export const roomExists = async (roomCode: string): Promise<boolean> => {
  if (useLocalStorage) {
    return localStorageService.roomExists(roomCode);
  }
  
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

// Clean up inactive users (called periodically)
export const cleanupInactiveUsers = async (roomCode: string) => {
  if (useLocalStorage) {
    return localStorageService.cleanupInactiveUsers();
  }
  
  const roomRef = ref(database, `rooms/${roomCode}/users`);
  const snapshot = await get(roomRef);
  
  if (snapshot.exists()) {
    const users = snapshot.val() as { [userId: string]: RoomUser };
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes
    
    Object.entries(users).forEach(async ([userId, user]) => {
      if (now - user.lastActive > timeout) {
        await leaveRoom(roomCode, userId);
      }
    });
  }
};

// Reaction interface
export interface Reaction {
  id: string;
  odUserId: string;
  userName: string;
  userColor: string;
  emoji: string;
  timestamp: number;
}

// Send a reaction to the room
export const sendReaction = async (
  roomCode: string,
  odUserId: string,
  userName: string,
  userColor: string,
  emoji: string
) => {
  if (useLocalStorage) {
    // For local storage, just emit a custom event that components can listen to
    const event = new CustomEvent('room-reaction', {
      detail: {
        id: Date.now().toString(),
        odUserId,
        userName,
        userColor,
        emoji,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
    return;
  }

  const reactionsRef = ref(database, `rooms/${roomCode}/reactions`);
  const newReactionRef = push(reactionsRef);
  await set(newReactionRef, {
    id: newReactionRef.key,
    odUserId,
    userName,
    userColor,
    emoji,
    timestamp: Date.now(),
  });

  // Auto-delete reaction after 5 seconds
  setTimeout(async () => {
    try {
      await remove(newReactionRef);
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 5000);
};

// Subscribe to reactions
export const subscribeToReactions = (
  roomCode: string,
  callback: (reactions: Reaction[]) => void
) => {
  if (useLocalStorage) {
    // For local storage, listen to custom events
    const handler = (e: CustomEvent) => {
      callback([e.detail as Reaction]);
    };
    window.addEventListener('room-reaction' as any, handler as EventListener);
    return () => window.removeEventListener('room-reaction' as any, handler as EventListener);
  }

  const reactionsRef = ref(database, `rooms/${roomCode}/reactions`);
  const unsubscribe = onValue(reactionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const reactions = Object.values(data) as Reaction[];
      // Only show reactions from the last 5 seconds
      const recentReactions = reactions.filter(
        (r) => Date.now() - r.timestamp < 5000
      );
      callback(recentReactions);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
};
