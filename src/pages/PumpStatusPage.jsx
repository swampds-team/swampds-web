import React, { useState, useEffect } from 'react';
import { Power, Clock, Activity } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import PumpControlCard from '../components/dashboard/PumpControlCard';
import { useSwampdsData, sendPumpCommand, setControlMode } from '../data/swampdsData';

function formatRuntime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const PUMP_KEYWORDS = ['pump', 'started', 'stopped'];
const isPumpAlert = (msg) => PUMP_KEYWORDS.some(kw => msg.toLowerCase().includes(kw));

export default function PumpStatusPage() {
  const { status, alerts } = useSwampdsData();
  const [runtime, setRuntime] = useState(0);

  // Runtime counter - resets when pump turns off
  useEffect(() => {
    if (status.pumpStatus !== 'on') {
      setRuntime(0);
      return;
    }
    const id = setInterval(() => setRuntime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [status.pumpStatus]);

  const recentPumpAlerts = alerts.filter(a => isPumpAlert(a.message)).slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Control card - full width on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PumpControlCard
            pumpStatus={status.pumpStatus}
            controlMode={status.controlMode}
            onToggleMode={() => setControlMode(status.controlMode === 'auto' ? 'manual' : 'auto')}
            onPumpCommand={sendPumpCommand}
          />
        </div>

        {/* Live runtime + stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Current Runtime" icon={Clock} iconColorClass="text-blue-500" />
            <div className={`text-4xl font-bold mt-2 ${status.pumpStatus === 'on' ? 'text-green-600' : 'text-slate-400'}`}>
              {status.pumpStatus === 'on' ? formatRuntime(runtime) : '-'}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {status.pumpStatus === 'on'
                ? 'Pump has been running this session'
                : 'Pump is not currently running'}
            </p>
          </Card>

          <Card>
            <CardHeader title="Control Mode" icon={Activity} iconColorClass="text-slate-500" />
            <div className="mt-2">
              <div className={`text-2xl font-bold ${status.controlMode === 'auto' ? 'text-blue-600' : 'text-orange-600'}`}>
                {status.controlMode === 'auto' ? 'Automatic' : 'Manual'}
              </div>
              <p className="text-sm text-slate-500 mt-2 leading-snug">
                {status.controlMode === 'auto'
                  ? 'Pump starts/stops automatically based on water level thresholds. Manual buttons are disabled.'
                  : 'You are in manual control. Use the Start/Stop buttons. Auto-logic is suspended.'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent pump activity */}
      <Card>
        <CardHeader title="Recent Pump Activity" icon={Power} iconColorClass="text-green-500" />
        {recentPumpAlerts.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No pump events recorded yet this session.</p>
        ) : (
          <div className="divide-y divide-slate-50 mt-2">
            {recentPumpAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-red-500' :
                  alert.severity === 'warning'  ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <p className="text-sm text-slate-700 flex-1">{alert.message}</p>
                <span className="text-xs text-slate-400 flex-shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
