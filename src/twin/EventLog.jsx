import React from 'react';
import { ListChecks } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { formatClock } from './format.js';

const DOT = { critical: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-500' };

/** Timestamped log of state changes, warnings, leaks and operator actions (newest first). */
export default function EventLog({ events, startedAt }) {
  return (
    <Card>
      <CardHeader title="Event Log" icon={ListChecks} iconColorClass="text-blue-500" />
      <ol className="max-h-72 overflow-y-auto divide-y divide-slate-50 -mx-1 px-1">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3 py-2.5 text-xs sm:text-sm">
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${DOT[e.severity] ?? DOT.info}`} />
            <span className="font-mono text-xs text-slate-400 flex-shrink-0 pt-0.5">{formatClock(startedAt, e.t)}</span>
            <span className="text-slate-700 leading-snug min-w-0">
              {e.source === 'operator' && (
                <span className="mr-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 align-middle">OPERATOR</span>
              )}
              {e.message}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
