import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app, auth, loginWithEmail, logoutUser } from '../firebase/firebaseConfig';

/** @type {React.Context<{ user: object|null, role: 'admin'|'viewer'|null, canEdit: boolean, loading: boolean, login: Function, logout: Function }|null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'admin' | 'viewer' | null. Starts (and stays, for anyone without a roles/<uid> entry) at
  // null - treated the same as 'viewer' everywhere in the UI - so edit controls are disabled
  // by default rather than briefly enabled while the real role is still loading.
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const resolved = useRef(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u ?? null);
      // Only clear loading on first resolution - subsequent token refreshes
      // from Firebase must not flip loading back to true and cause a blank flash
      if (!resolved.current) {
        resolved.current = true;
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Role lives in the database (roles/<uid>), set by hand alongside each account - see
  // README "Firebase setup checklist". Kept live, so a role change while someone is
  // signed in takes effect immediately without them having to sign out and back in.
  useEffect(() => {
    if (!user) { setRole(null); return; }
    const db = getDatabase(app);
    const unsubscribe = onValue(ref(db, `roles/${user.uid}`), (snap) => {
      setRole(snap.val() === 'admin' ? 'admin' : 'viewer');
    });
    return unsubscribe;
  }, [user]);

  /** @param {string} email @param {string} password */
  const login = (email, password) => loginWithEmail(email, password);

  const logout = () => logoutUser();

  return (
    <AuthContext.Provider value={{ user, role, canEdit: role === 'admin', loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Consume auth context inside any component.
 * @returns {{ user: object|null, role: 'admin'|'viewer'|null, canEdit: boolean, loading: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
