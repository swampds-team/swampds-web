import React from 'react';
import { SlidersHorizontal, RotateCcw, ShieldCheck, Info } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import PumpControlCard from '../components/dashboard/PumpControlCard';
import { DEFAULT_CONFIG, SEGMENTS } from './config.js';

const BTN = 'px-4 py-3 min-h-[44px] rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2';

const STOP_TEXT = {
  leak: 'Pump held off by leak protection until the alarm is reset.',
  'source-empty': 'Pump held off: source tank is empty. Refill it to continue.',
  'delivery-full': 'Pump held off: delivery tank is full.',
};

function RangeField({ id, label, value, unit, min, max, step = 1, accent, onChange, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium text-slate-700">{label}</label>
        <span className="font-mono font-semibold text-slate-800">{value}{unit}</span>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-11 cursor-pointer ${accent}`}
      />
      {hint && <p className="text-xs text-slate-400 -mt-1">{hint}</p>}
    </div>
  );
}

/**
 * All operator controls for the twin (valves, reset, pump, tanks, calibration).
 * @param {{ twin: ReturnType<import('./useTwin.js').useTwin> }} props
 */
export default function ControlPanel({ twin }) {
  const {
    sim, config, notice,
    setValve, setMode, setManualCommand, acknowledgeReset,
    refillSource, emptyDelivery, updateConfig, resetConfig, restart,
  } = twin;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Leak valves + reset */}
      <Card>
        <CardHeader title="Introduce a Leak" icon={SlidersHorizontal} iconColorClass="text-orange-500" />
        <div className="space-y-1">
          {Object.entries(SEGMENTS).map(([id, seg]) => (
            <RangeField
              key={id} id={`valve-${id}`} label={`Valve ${id} (${seg.from}→${seg.to})`}
              value={sim.valves[id]} unit="% open" min={0} max={100}
              accent="accent-orange-500" onChange={(v) => setValve(id, v)}
            />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={acknowledgeReset}
            disabled={!sim.latched}
            className={`${BTN} w-full ${sim.latched ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            Acknowledge &amp; Reset
          </button>
          <p role="status" className={`text-xs mt-2 min-h-[1rem] ${notice ? (notice.ok ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>
            {notice ? notice.text : sim.latched ? 'Close both valves, then reset.' : 'Available after a leak alarm.'}
          </p>
        </div>
      </Card>

      {/* Pump */}
      <div>
        <PumpControlCard
          pumpStatus={sim.pumpOn ? 'on' : 'off'}
          controlMode={sim.mode}
          onToggleMode={() => setMode(sim.mode === 'auto' ? 'manual' : 'auto')}
          onPumpCommand={setManualCommand}
        />
        {sim.stopReason && (
          <p className="flex items-start gap-1.5 text-xs text-amber-700 mt-2 px-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {STOP_TEXT[sim.stopReason]}
          </p>
        )}
      </div>

      {/* Tanks + restart */}
      <Card>
        <CardHeader title="Tanks &amp; Demo" icon={RotateCcw} iconColorClass="text-blue-500" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={refillSource} className={`${BTN} border border-slate-200 text-slate-700 hover:bg-slate-50`}>Refill source</button>
          <button onClick={emptyDelivery} className={`${BTN} border border-slate-200 text-slate-700 hover:bg-slate-50`}>Empty delivery</button>
        </div>
        <button onClick={restart} className={`${BTN} w-full mt-2 border border-slate-200 text-slate-700 hover:bg-slate-50`}>
          <RotateCcw className="w-4 h-4" /> Restart simulation
        </button>
      </Card>

      {/* Calibration */}
      <Card>
        <CardHeader title="Detection Calibration" icon={SlidersHorizontal} iconColorClass="text-slate-500" />
        <div className="space-y-1">
          <RangeField
            id="tolerance" label="Tolerance" value={config.tolerancePct} unit="%" min={2} max={30}
            accent="accent-blue-600" onChange={(v) => updateConfig({ tolerancePct: v })}
            hint="How much two neighbouring sensors may differ."
          />
          <RangeField
            id="persist" label="Persistence" value={config.persistSec} unit=" s" min={1} max={10} step={0.5}
            accent="accent-blue-600" onChange={(v) => updateConfig({ persistSec: v })}
            hint="How long a difference must last to count as a leak."
          />
        </div>
        <button
          onClick={resetConfig}
          disabled={config.tolerancePct === DEFAULT_CONFIG.tolerancePct && config.persistSec === DEFAULT_CONFIG.persistSec}
          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed min-h-[36px]"
        >
          Restore defaults
        </button>
      </Card>
    </div>
  );
}
