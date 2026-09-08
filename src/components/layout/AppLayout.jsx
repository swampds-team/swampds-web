import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Activity,
  Power,
  Bell,
  History,
  Settings,
} from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar  from './TopBar';
import { useSwampdsData } from '../../data/swampdsData';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/water-level',  icon: Droplets,        label: 'Water Level'  },
  { to: '/flow-sensors', icon: Activity,        label: 'Flow Sensors' },
  { to: '/pump-status',  icon: Power,           label: 'Pump Status'  },
  { to: '/alerts',       icon: Bell,            label: 'Alerts'       },
  { to: '/history',      icon: History,         label: 'Pumping History' },
  { to: '/settings',     icon: Settings,        label: 'Settings'     },
];

const ROUTE_TITLES = {
  '/dashboard':    'Dashboard',
  '/water-level':  'Water Level',
  '/flow-sensors': 'Flow Sensors',
  '/pump-status':  'Pump Status',
  '/alerts':       'Alerts',
  '/history':      'Pumping History',
  '/settings':     'Settings',
};

/**
 * Root shell for all authenticated pages.
 * Responsive layout: drawer on mobile (<768px), persistent sidebar on desktop (>=768px).
 */
export default function AppLayout() {
  const { pathname } = useLocation();
  const { alerts, status } = useSwampdsData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Automatically close mobile drawer whenever the user navigates
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fire a browser notification when systemStatus worsens
  const prevStatusRef = React.useRef(null);
  useEffect(() => {
    const current = status?.systemStatus;
    const prev    = prevStatusRef.current;

    // Skip the very first render (no previous state yet)
    if (prev === null) {
      prevStatusRef.current = current;
      return;
    }

    if (current !== prev) {
      prevStatusRef.current = current;

      if ('Notification' in window && Notification.permission === 'granted') {
        const messages = {
          warning: { title: 'SWAMPDS - Warning',       body: 'Flow variation detected. Monitor closely.' },
          leak:    { title: 'SWAMPDS - Leak Detected', body: 'Significant flow divergence detected. Inspect the pipeline immediately.' },
          fault:   { title: 'SWAMPDS - Sensor Fault',  body: 'A flow sensor is reading near zero. Manual inspection required.' },
          normal:  { title: 'SWAMPDS - All Clear',     body: 'System has returned to normal operation.' },
        };
        const msg = messages[current];
        if (msg) {
          new Notification(msg.title, {
            body: msg.body,
            icon: '/favicon.svg',
            tag:  'swampds-status', // replaces previous notification instead of stacking
          });
        }
      }
    }
  }, [status?.systemStatus]);

  const pageTitle  = ROUTE_TITLES[pathname] ?? 'SWAMPDS';
  const alertCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        navItems={NAV_ITEMS}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={pageTitle}
          alertCount={alertCount}
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
