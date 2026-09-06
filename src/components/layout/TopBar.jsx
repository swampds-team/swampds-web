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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-slate-500 hover:text-slate-700"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button className="relative p-2 text-slate-400 hover:text-slate-600" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
