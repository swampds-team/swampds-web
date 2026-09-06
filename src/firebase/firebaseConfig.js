/**
 * @fileoverview Firebase configuration - THE credential swap boundary.
 *
 * TO WIRE REAL FIREBASE (one-file change):
 * ─────────────────────────────────────────
 * 1. npm install firebase
 * 2. Replace this entire file with the following:
 *
 *    import { initializeApp } from 'firebase/app';
 *    import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
 *
 *    const firebaseConfig = {
 *      apiKey:            "YOUR_API_KEY",
 *      authDomain:        "YOUR_PROJECT.firebaseapp.com",
 *      databaseURL:       "YOUR_PROJECT.firebaseio.com",
 *      projectId:         "YOUR_PROJECT_ID",
 *      storageBucket:     "YOUR_PROJECT.appspot.com",
 *      messagingSenderId: "YOUR_SENDER_ID",
 *      appId:             "YOUR_APP_ID",
 *    };
 *
 *    const app  = initializeApp(firebaseConfig);
 *    export const auth = getAuth(app);
 *
 *    export const loginWithEmail = (email, password) =>
 *      signInWithEmailAndPassword(auth, email, password);
 *
 *    export const logoutUser = () => signOut(auth);
 *
 * Nothing outside this file changes.
 * ─────────────────────────────────────────
 *
 * MOCK BEHAVIOUR (current):
 *   - Any non-empty email + password signs in successfully.
 *   - Session is in-memory only; page reload requires signing in again.
 *     (Real Firebase onAuthStateChanged handles persistence automatically.)
 */

// ---------------------------------------------------------------------------
// Mock Auth Store
// ---------------------------------------------------------------------------

let _currentUser = null;
const _authListeners = new Set();

const _notifyAuth = (user) => {
  _currentUser = user;
  _authListeners.forEach(fn => fn(user));
};

/**
 * Mock auth object - mirrors the shape of Firebase Auth instance.
 * AuthContext calls auth.onAuthStateChanged() to subscribe to user changes.
 */
export const auth = {
  get currentUser() {
    return _currentUser;
  },

  /**
   * Subscribe to auth state changes.
   * @param {(user: object|null) => void} callback
   * @returns {() => void} unsubscribe function
   */
  onAuthStateChanged(callback) {
    _authListeners.add(callback);
    // Immediately invoke with current state (mirrors Firebase behaviour)
    callback(_currentUser);
    return () => _authListeners.delete(callback);
  },
};

/**
 * Sign in with email and password.
 * Mock: succeeds for any non-empty credentials.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ uid: string, email: string }>}
 */
export async function loginWithEmail(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  // Simulate brief network latency
  await new Promise(r => setTimeout(r, 400));
  const user = { uid: 'mock-uid-swampds-001', email };
  _notifyAuth(user);
  return user;
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  await new Promise(r => setTimeout(r, 150));
  _notifyAuth(null);
}
