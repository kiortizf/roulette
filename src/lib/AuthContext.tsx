import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, signInAnonymous, signInWithGoogle, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle mock auth for local mode
    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: 'local-user-' + Math.random().toString(36).substring(7),
        isAnonymous: true,
        displayName: 'Local User',
      } as User;
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto sign in anonymously if not signed in and Firebase is configured
    if (!loading && !user && isFirebaseConfigured) {
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
