import React from 'react';
import { Activity, History } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { usePumpHistory, useSwampdsData } from '../data/swampdsData';

const BASE_EVENTS = [
  { border: 'border-green-500', time: '08:00 AM', title: 'System Boot',  desc: 'SWAMPDS initialized successfully.' },
  { border: 'border-blue-500',  time: '07:50 AM', title: 'Pump Started', desc: 'Auto mode: water level below 20% threshold.' },
];

export default function PumpingHistory() {
  const history = usePumpHistory();
  const { alerts } = useSwampdsData();

  // Wire to live alerts array as single source of truth, with baseline events at the bottom
  const liveEvents = alerts.map(a => ({
    border: a.severity === 'critical' ? 'border-red-500' : a.severity === 'warning' ? 'border-amber-500' : 'border-blue-500',
    time: a.time,
    title: a.severity === 'critical' ? 'Alert / Divergence' : a.severity === 'warning' ? 'Warning Issued' : 'System Notice',
    desc: a.message,
  }));

  const allEvents = [...liveEvents, ...BASE_EVENTS].slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Full pump event table */}
        <Card className="lg:col-span-2">
          <CardHeader title="Pumping Session Log" icon={History} />
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-400">All recorded pump on/off sessions.</p>
            <span className="text-[11px] text-slate-400 sm:hidden">Scroll table →</span>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 text-xs">
                  {['Date', 'Start', 'End', 'Duration'].map(h => (
                    <th key={h} className="pb-3 font-medium pr-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium">{row.date}</td>
                    <td className="py-3 pr-4">{row.start}</td>
                    <td className="py-3 pr-4">{row.end}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Event log */}
        <Card>
          <CardHeader title="System Event Log" icon={Activity} />
          <p className="text-xs text-slate-400 mb-4">Real-time alerts and state changes.</p>
          <div className="space-y-3.5">
            {allEvents.map(({ border, time, title, desc }, idx) => (
              <div key={idx} className={`flex gap-3 text-sm border-l-2 ${border} pl-3 py-0.5`}>
                <div className="text-slate-400 w-16 flex-shrink-0 text-xs pt-0.5 font-mono">{time}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm">{title}</p>
                  <p className="text-slate-500 mt-0.5 text-xs leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
