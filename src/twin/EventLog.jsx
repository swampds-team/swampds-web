import React, { useState, useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { Card } from '../components/Card';
import { formatClock } from './format.js';

const SEVERITY_DOT = {
  critical: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
  warning: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  info: 'bg-blue-500',
};

/**
 * Filterable, timestamped audit log of simulation events, warnings, leaks, and operator actions.
 */
export default function EventLog({ events, startedAt }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'operator'

  const filtered = useMemo(() => {
    if (filter === 'critical') return events.filter((e) => e.severity === 'critical');
    if (filter === 'operator') return events.filter((e) => e.source === 'operator');
    return events;
  }, [events, filter]);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Event Audit Log</h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-2 rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ALL ({events.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-2.5 py-2 rounded-md transition-colors ${
              filter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ALARMS
          </button>
          <button
            onClick={() => setFilter('operator')}
            className={`px-2.5 py-2 rounded-md transition-colors ${
              filter === 'operator'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            ACTIONS
          </button>
        </div>
      </div>

      <ol className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 -mx-1 px-1">
        {filtered.length === 0 ? (
          <li className="py-6 text-center text-xs text-slate-400 font-mono">No matching events</li>
        ) : (
          filtered.map((e) => (
            <li key={e.id} className="flex items-start gap-2.5 py-2 text-xs">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SEVERITY_DOT[e.severity] ?? SEVERITY_DOT.info}`}
              />
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 pt-0.5">
                {formatClock(startedAt, e.t)}
              </span>
              <span className="text-slate-700 dark:text-slate-300 leading-snug min-w-0">
                {e.source === 'operator' && (
                  <span className="mr-1.5 px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[9px] font-mono font-bold align-middle">
                    OPERATOR
                  </span>
                )}
                {e.severity === 'critical' && (
                  <span className="mr-1.5 px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold align-middle">
                    ALARM
                  </span>
                )}
                {e.message}
              </span>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}
