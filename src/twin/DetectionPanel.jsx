import React from 'react';
import { Gauge } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { SEGMENTS } from './config.js';

const STATE = {
  leak:  { label: 'LEAK',     pill: 'bg-red-100 text-red-700',     bar: 'bg-red-500'   },
  watch: { label: 'WATCHING', pill: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  ok:    { label: 'OK',       pill: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
};

/** Live compare-and-persist view: % difference and the persistence timer per pipe segment. */
export default function DetectionPanel({ sim, config }) {
  return (
    <Card>
      <CardHeader title="Leak Detection" icon={Gauge} iconColorClass="text-orange-500" />
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        A segment is flagged when its two sensors differ by more than <strong>{config.tolerancePct}%</strong>,
        and declared a leak only if that lasts <strong>{config.persistSec} s</strong>.
      </p>

      <div className="space-y-4">
        {Object.entries(SEGMENTS).map(([id, seg]) => {
          const s = sim.segments[id];
          const key = s.leak ? 'leak' : s.abnormalFor > 0 ? 'watch' : 'ok';
          const st = STATE[key];
          const progress = s.leak ? 1 : Math.min(1, s.abnormalFor / config.persistSec);
          return (
            <div key={id}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-700">{seg.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${st.pill}`}>{st.label}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>Difference <span className="font-mono font-semibold text-slate-700">{s.diffPct.toFixed(1)}%</span></span>
                <span>Timer <span className="font-mono font-semibold text-slate-700">{Math.min(s.abnormalFor, config.persistSec).toFixed(1)} / {config.persistSec} s</span></span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar"
                aria-label={`Persistence timer, segment ${id}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
                <div className={`h-full rounded-full transition-[width] duration-300 ${st.bar}`} style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
