import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

/**
 * Route layout that provides Firebase auth to everything nested under it.
 * Public pages that must work without Firebase (e.g. /twin) sit outside this shell.
 */
export default function AuthShell() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
