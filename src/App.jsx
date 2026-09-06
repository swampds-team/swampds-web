import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider }  from './auth/AuthContext';
import ProtectedRoute    from './auth/ProtectedRoute';
import AppLayout         from './components/layout/AppLayout';

// Public route
import Login             from './pages/Login';

// Protected pages
import Dashboard         from './pages/Dashboard';
import WaterLevelPage    from './pages/WaterLevelPage';
import FlowSensorsPage   from './pages/FlowSensorsPage';
import PumpStatusPage    from './pages/PumpStatusPage';
import AlertsPage        from './pages/AlertsPage';
import PumpingHistory    from './pages/PumpingHistory';
import SettingsPage      from './pages/SettingsPage';
import NotFound          from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected: must be signed in ── */}
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
