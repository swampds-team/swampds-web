import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Everything that touches Firebase is lazy-loaded, so public pages such as /twin
// never download or initialise it (and work with no VITE_FIREBASE_* variables).
const AuthShell        = lazy(() => import('./auth/AuthShell'));
const ProtectedRoute   = lazy(() => import('./auth/ProtectedRoute'));
const AppLayout        = lazy(() => import('./components/layout/AppLayout'));

// Public routes
const Login            = lazy(() => import('./pages/Login'));
const TwinPage         = lazy(() => import('./twin/TwinPage'));

// Protected pages
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const WaterLevelPage   = lazy(() => import('./pages/WaterLevelPage'));
const FlowSensorsPage  = lazy(() => import('./pages/FlowSensorsPage'));
const PumpStatusPage   = lazy(() => import('./pages/PumpStatusPage'));
const AlertsPage       = lazy(() => import('./pages/AlertsPage'));
const PumpingHistory   = lazy(() => import('./pages/PumpingHistory'));
const SettingsPage     = lazy(() => import('./pages/SettingsPage'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public, no Firebase: digital twin simulation ── */}
          <Route path="/twin" element={<TwinPage />} />

          {/* ── Everything below needs Firebase auth ── */}
          <Route element={<AuthShell />}>
            <Route path="/login" element={<Login />} />

            {/* Protected: must be signed in */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index                element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<Dashboard />}       />
                <Route path="/water-level"  element={<WaterLevelPage />}  />
                <Route path="/flow-sensors" element={<FlowSensorsPage />} />
                <Route path="/pump-status"  element={<PumpStatusPage />}  />
                <Route path="/alerts"       element={<AlertsPage />}      />
                <Route path="/history"      element={<PumpingHistory />}  />
                <Route path="/settings"     element={<SettingsPage />}    />
                <Route path="*"             element={<NotFound />}        />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
