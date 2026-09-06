import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, loginWithEmail, logoutUser } from '../firebase/firebaseConfig';

/** @type {React.Context<{ user: object|null, loading: boolean, login: Function, logout: Function }|null>} */
const AuthContext = createContext(null);

/**
 * Wraps the application and provides auth state to all descendants.
 * Swap: when real Firebase is wired in, auth.onAuthStateChanged() in
 * firebaseConfig.js handles session persistence automatically -
 * nothing here needs to change.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u ?? null);
      setLoading(false);
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
