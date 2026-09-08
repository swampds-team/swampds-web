import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Menu } from 'lucide-react';

/**
 * @param {{ title: string, alertCount?: number, onMenuClick?: () => void }} props
 */
export default function TopBar({ title, alertCount = 0, onMenuClick }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-3">
        <button
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] flex-shrink-0"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-5 text-xs sm:text-sm text-slate-600 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg sm:bg-transparent sm:p-0">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          <span className="font-medium text-slate-700">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button
          className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
