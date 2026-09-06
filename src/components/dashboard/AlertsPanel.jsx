import React from 'react';
import { AlertTriangle, CheckCircle2, Info, Bell } from 'lucide-react';
import { Card, CardHeader } from '../Card';

const SEVERITY_CONFIG = {
  critical: {
    Icon: AlertTriangle,
    iconClass: 'text-red-500',
    labelClass: 'text-red-700',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500',
    labelClass: 'text-amber-700',
  },
  info: {
    Icon: Info,
    iconClass: 'text-blue-500',
    labelClass: 'text-blue-700',
  },
};

function AlertItem({ alert }) {
  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
  const { Icon, iconClass, labelClass } = cfg;

  return (
    <div className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0">
      <div className="mt-0.5 flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div>
        <h4 className={`text-sm font-semibold ${labelClass}`}>
          {alert.severity.toUpperCase()}
        </h4>
        <p className="text-sm text-slate-600 mt-0.5 leading-snug">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
      </div>
    </div>
  );
}

/**
 * @param {{ alerts: { time: string, severity: 'critical'|'warning'|'info', message: string }[] }} props
 */
export default function AlertsPanel({ alerts }) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Active Alerts" icon={Bell} iconColorClass="text-red-500" />
      <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <span className="text-sm">No active alerts</span>
          </div>
        ) : (
          alerts.map((alert, idx) => <AlertItem key={idx} alert={alert} />)
        )}
      </div>
    </Card>
  );
}
