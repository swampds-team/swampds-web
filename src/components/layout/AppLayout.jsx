import React from 'react';
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
 * Uses <Outlet /> so react-router nested routes render inside <main>.
 * Derives page title automatically from pathname.
 */
export default function AppLayout() {
  const { pathname } = useLocation();
  const { alerts }   = useSwampdsData();

  const pageTitle  = ROUTE_TITLES[pathname] ?? 'SWAMPDS';
  const alertCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar navItems={NAV_ITEMS} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={pageTitle} alertCount={alertCount} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
