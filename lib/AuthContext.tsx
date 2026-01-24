'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInAnonymous, signInWithGoogle } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    // Auto sign in anonymously if not signed in
    if (!loading && !user) {
      signInAnonymous().catch(console.error);
    }
  }, [user, loading]);

  const handleSignInAnonymously = async () => {
    await signInAnonymous();
  };

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        loading,
        signInAnonymously: handleSignInAnonymously,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
