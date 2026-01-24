import { create } from 'zustand';
import { Movie } from './types';

export interface User {
  id: string;
  name: string;
  color: string;
  selectedMovies: Movie[];
  isReady: boolean;
}

interface RoomState {
  roomCode: string;
  currentUser: User | null;
  users: User[];
  isSpinning: boolean;
  selectedWinner: Movie | null;
  
  // Actions
  setRoomCode: (code: string) => void;
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserMovies: (userId: string, movies: Movie[]) => void;
  toggleUserReady: (userId: string) => void;
  setSpinning: (isSpinning: boolean) => void;
  setWinner: (movie: Movie | null) => void;
  resetRoom: () => void;
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export const useRoomStore = create<RoomState>((set, get) => ({
  roomCode: '',
  currentUser: null,
  users: [],
  isSpinning: false,
  selectedWinner: null,

  setRoomCode: (code: string) => set({ roomCode: code }),

  setCurrentUser: (user: User) => {
    set({ currentUser: user });
    // Also add to users array if not already there
    const { users } = get();
    if (!users.find(u => u.id === user.id)) {
      set({ users: [...users, user] });
    }
  },

  addUser: (user: User) => {
    const { users } = get();
    if (!users.find(u => u.id === user.id)) {
      set({ users: [...users, user] });
    }
  },

  removeUser: (userId: string) => {
    const { users } = get();
    set({ users: users.filter(u => u.id !== userId) });
  },

  updateUserMovies: (userId: string, movies: Movie[]) => {
    const { users, currentUser } = get();
    
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, selectedMovies: movies } : user
    );
    
    set({ users: updatedUsers });
    
    if (currentUser?.id === userId) {
      set({ currentUser: { ...currentUser, selectedMovies: movies } });
    }
  },

  toggleUserReady: (userId: string) => {
    const { users, currentUser } = get();
    
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, isReady: !user.isReady } : user
    );
    
    set({ users: updatedUsers });
    
    if (currentUser?.id === userId) {
      set({ currentUser: { ...currentUser, isReady: !currentUser.isReady } });
    }
  },

  setSpinning: (isSpinning: boolean) => set({ isSpinning }),

  setWinner: (movie: Movie | null) => set({ selectedWinner: movie }),

  resetRoom: () => {
    const { currentUser, roomCode } = get();
    set({
      users: currentUser ? [{ ...currentUser, selectedMovies: [], isReady: false }] : [],
      isSpinning: false,
      selectedWinner: null,
    });
  },
}));

export const generateUserId = () => {
  return `user-${Math.random().toString(36).substr(2, 9)}`;
};

export const getRandomColor = () => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};
