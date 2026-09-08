import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Droplets, LogOut, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors min-h-[44px] ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

/** Derive two-letter initials from an email address. */
const getInitials = (email) => {
  if (!email) return 'AD';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

/**
 * @param {{
 *   navItems: { to: string, icon: React.ComponentType, label: string }[],
 *   isOpen?: boolean,
 *   onClose?: () => void,
 * }} props
 */
export default function Sidebar({ navItems, isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/login', { replace: true });
  };

  const initials = getInitials(user?.email);
  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const displaySub = user?.email ?? 'Administrator';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0B1120] text-white flex flex-col h-full flex-shrink-0 transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 md:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header + mobile close button */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-blue-500 flex-shrink-0" />
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">SWAMPDS</h1>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Smart Water Monitoring &amp;<br />Pump Control System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        {/* User badge + logout */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate capitalize">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{displaySub}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
