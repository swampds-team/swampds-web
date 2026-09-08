import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

/**
 * Firebase credentials are loaded from environment variables.
 *
 * Locally:     add to .env.local (already gitignored - never committed)
 * On Vercel:   add each VITE_* key in Project Settings > Environment Variables
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Sign in with email and password.
 * Accounts are created in the Firebase console - no registration UI needed.
 * @param {string} email
 * @param {string} password
 */
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/** Sign out the current user. */
export const logoutUser = () => signOut(auth);

