import { ref, set, update, onValue, off, remove, push, get } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';
import { localStorageService } from './localStorageService';
import { Movie } from './types';

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

// Set winner and save to history
export const setRoomWinner = async (roomCode: string, winner: Movie | null) => {
  if (useLocalStorage) {
    return localStorageService.setRoomWinner(roomCode, winner!);
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
      Object.keys(roomData.users).forEach(async (userId) => {
        const userHistoryRef = ref(database, `userHistory/${userId}`);
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

  return () => off(roomRef, 'value', unsubscribe);
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
