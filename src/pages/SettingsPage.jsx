import React from 'react';
import { Settings, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { PUMP_THRESHOLDS } from '../data/swampdsData';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">

      <Card>
        <CardHeader title="Automatic Control Thresholds" icon={Settings} iconColorClass="text-blue-500" />
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          These thresholds control when the pump starts and stops in <strong>Auto</strong> mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Pump ON at or below
            </div>
            <div className="text-3xl font-bold text-red-600 mt-2">{PUMP_THRESHOLDS.low}%</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-snug">
              Pump starts automatically when the water level drops to this.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Pump OFF at or above
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{PUMP_THRESHOLDS.full}%</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-snug">
              Pump stops automatically when the water level rises to this.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 mt-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            These values are read-only. They are set in the embedded firmware, which is what the
            hardware acts on. To change them, update the firmware.
          </span>
        </div>
      </Card>

    </div>
  );
}
