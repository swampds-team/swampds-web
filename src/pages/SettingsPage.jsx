import React, { useState } from 'react';
import { Settings, Save, Info } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';

// These thresholds must match the auto-pump logic in swampdsData.js.
// When Settings persistence is implemented, these will be written to
// Firebase and read back by the data layer.
const DEFAULTS = { lowLevel: 20, fullLevel: 95 };

function FieldGroup({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
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
    // TODO: persist to Firebase - set(ref(db, 'settings/thresholds'), thresholds)
    console.log('[SWAMPDS] Threshold settings saved (mock):', thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Threshold configuration */}
      <Card>
        <CardHeader title="Automatic Control Thresholds" icon={Settings} iconColorClass="text-blue-500" />
        <p className="text-sm text-slate-500 mb-6">
          These thresholds control when the pump starts and stops in <strong>Auto</strong> mode.
          Changes here are UI-only until Firebase persistence is wired in.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldGroup label="Pump ON below (% water level)" id="lowLevel">
              <div className="flex items-center gap-3">
                <input
                  id="lowLevel"
                  type="number"
                  min={0}
                  max={100}
                  value={thresholds.lowLevel}
                  onChange={handleChange('lowLevel')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <span className="text-slate-400 font-medium text-sm w-5">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <span className="text-slate-400 font-medium text-sm w-5">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Pump stops automatically when level rises above this.
              </p>
            </FieldGroup>
          </div>

          {thresholds.lowLevel >= thresholds.fullLevel && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              Low-level threshold must be less than the full-level threshold.
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={thresholds.lowLevel >= thresholds.fullLevel}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Thresholds
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Saved (UI only - Firebase not yet wired)
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Firebase config placeholder */}
      <Card>
        <CardHeader title="Firebase Configuration" icon={Settings} iconColorClass="text-slate-400" />
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          {['API Key', 'Auth Domain', 'Database URL', 'Project ID'].map(field => (
            <div key={field} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">{field}</span>
              <div className="flex-1 h-8 rounded-lg bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Firebase credentials are configured in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">src/firebase/firebaseConfig.js</code>.
          Contact the system administrator to update them.
        </p>
      </Card>
    </div>
  );
}
