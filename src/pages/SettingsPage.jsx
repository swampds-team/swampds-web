import React, { useState } from 'react';
import { Settings, Save, Info } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';

// These thresholds match the auto-pump logic in swampdsData.js.
const DEFAULTS = { lowLevel: 20, fullLevel: 95 };

function FieldGroup({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const handleChange = (key) => (e) => {
    const val = Math.max(0, Math.min(100, Number(e.target.value)));
    setThresholds(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">

      <Card>
        <CardHeader title="Automatic Control Thresholds" icon={Settings} iconColorClass="text-blue-500" />
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          These thresholds control when the pump starts and stops in <strong>Auto</strong> mode.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FieldGroup label="Pump ON below (% water level)" id="lowLevel">
              <div className="flex items-center gap-3">
                <input
                  id="lowLevel"
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.lowLevel}
                  onChange={handleChange('lowLevel')}
                  className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <span className="text-slate-400 font-medium text-sm w-5">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                Pump starts automatically when level drops below this.
              </p>
            </FieldGroup>

            <FieldGroup label="Pump OFF above (% water level)" id="fullLevel">
              <div className="flex items-center gap-3">
                <input
                  id="fullLevel"
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.fullLevel}
                  onChange={handleChange('fullLevel')}
                  className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <span className="text-slate-400 font-medium text-sm w-5">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-snug">
                Pump stops automatically when level rises above this.
              </p>
            </FieldGroup>
          </div>

          {thresholds.lowLevel >= thresholds.fullLevel && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              Low-level threshold must be less than the full-level threshold.
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm">
            <Info className="w-4 h-4 flex-shrink-0" />
            Threshold changes here update the display only. To change the values the hardware acts on, update them in the embedded firmware or Firebase directly.
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <button
              type="submit"
              disabled={thresholds.lowLevel >= thresholds.fullLevel}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium text-center sm:text-left">
                ✓ Saved
              </span>
            )}
          </div>
        </form>
      </Card>

    </div>
  );
}
