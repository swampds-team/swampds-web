import React from 'react';
import { Gauge, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { SEGMENTS } from './config.js';

export default function DetectionPanel({ sim, config }) {
  const { segments } = sim;

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <CardHeader
        title="Differential Detection"
        icon={Gauge}
        iconColorClass="text-slate-500 dark:text-slate-400"
      />

      <div className="space-y-3">
        {Object.entries(SEGMENTS).map(([id, seg]) => {
          const s = segments[id];
          const isLeak = s.leak;
          const isWarning = s.abnormalFor > 0;
          const progress = isLeak ? 1 : Math.min(1, s.abnormalFor / config.persistSec);

          return (
            <div
              key={id}
              className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{seg.label}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-0.5 font-mono">
                    ({seg.from} <ArrowRight className="w-2.5 h-2.5 inline" /> {seg.to})
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isLeak
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isLeak ? 'Leak Confirmed' : isWarning ? 'Verifying' : 'Normal'}
                </span>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Variance:{' '}
                  <span
                    className={`font-mono font-semibold ${
                      s.diffPct > config.tolerancePct
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {s.diffPct.toFixed(1)}%
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">(&gt;{config.tolerancePct}% limit)</span>
                </div>

                <div>
                  Timer:{' '}
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {Math.min(s.abnormalFor, config.persistSec).toFixed(1)}s
                  </span>
                  <span className="text-[10px] text-slate-400"> / {config.persistSec}s</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLeak ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
