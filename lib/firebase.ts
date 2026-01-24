import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Check if Firebase is configured
export const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_firebase_api_key' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'your-project-id';

// Initialize Firebase only if configured
let app: any = null;
let auth: any = null;
let database: any = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  database = getDatabase(app);
} else {
  console.warn('⚠️  Firebase not configured. Using local-only mode. See README.firebase.md to set up Firebase.');
  // Create mock auth for local mode with all required methods
  const mockUser = {
    uid: 'local-user',
    isAnonymous: true,
    displayName: 'Local User',
    email: null,
    emailVerified: false,
    phoneNumber: null,
    photoURL: null,
    providerId: 'local',
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
  };
  
  auth = {
    currentUser: mockUser,
    onAuthStateChanged: (callback: any) => {
      // Immediately call callback with mock user
      setTimeout(() => callback(mockUser), 0);
      // Return unsubscribe function
      return () => {};
    },
    signOut: async () => {},
    updateCurrentUser: async () => {},
  };
}

const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

// Anonymous sign in for quick access
export const signInAnonymous = async () => {
  if (!isFirebaseConfigured) {
    // Mock user for local testing
    return {
      uid: 'local-' + Math.random().toString(36).substring(7),
      isAnonymous: true,
    } as any;
  }
  
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

// Google sign in for persistent accounts
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export { auth, database, app };
