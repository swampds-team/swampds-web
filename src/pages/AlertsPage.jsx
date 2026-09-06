import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Bell } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { useSwampdsData } from '../data/swampdsData';

const SEVERITY_CONFIG = {
  critical: { Icon: AlertTriangle, iconClass: 'text-red-500',   labelClass: 'text-red-700',   badgeCls: 'bg-red-100 text-red-700'   },
  warning:  { Icon: AlertTriangle, iconClass: 'text-amber-500', labelClass: 'text-amber-700', badgeCls: 'bg-amber-100 text-amber-700' },
  info:     { Icon: Info,          iconClass: 'text-blue-500',  labelClass: 'text-blue-700',  badgeCls: 'bg-blue-100 text-blue-700'  },
};

const FILTERS = ['all', 'critical', 'warning', 'info'];

function AlertRow({ alert }) {
  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
  const { Icon, iconClass, labelClass, badgeCls } = cfg;
  return (
    <div className="flex gap-4 items-start py-4 border-b border-slate-50 last:border-0">
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">{alert.time}</span>
        </div>
        <p className="text-sm text-slate-700 mt-1 leading-snug">{alert.message}</p>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { alerts } = useSwampdsData();
  const [filter, setFilter]   = useState('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const counts = FILTERS.slice(1).reduce((acc, sev) => {
    acc[sev] = alerts.filter(a => a.severity === sev).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {counts.critical > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
            <AlertTriangle className="w-4 h-4" />
            {counts.critical} Critical
          </div>
        )}
        {counts.warning > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {counts.warning} Warning
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-700">
          <Info className="w-4 h-4" />
          {counts.info ?? 0} Info
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <CardHeader title="Alert History" icon={Bell} iconColorClass="text-red-500" />

          {/* Filter buttons */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === f
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'all' ? `All (${alerts.length})` : `${f} (${counts[f] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <p className="text-sm">No {filter !== 'all' ? filter : ''} alerts.</p>
          </div>
        ) : (
          <div>
            {filtered.map((alert, idx) => (
              <AlertRow key={idx} alert={alert} />
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
