import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, loginWithEmail, logoutUser } from '../firebase/firebaseConfig';

/** @type {React.Context<{ user: object|null, loading: boolean, login: Function, logout: Function }|null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  /** @param {string} email @param {string} password */
  const login = (email, password) => loginWithEmail(email, password);

  const logout = () => logoutUser();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Consume auth context inside any component.
 * @returns {{ user: object|null, loading: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
