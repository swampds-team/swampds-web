import React from 'react';
import { Power, Settings2, Radio } from 'lucide-react';
import { Card, CardHeader } from '../Card';

/**
 * @param {{
 *   pumpStatus: 'on'|'off',
 *   controlMode: 'auto'|'manual',
 *   onToggleMode: () => void,
 *   onPumpCommand: (cmd: 'on'|'off') => void,
 * }} props
 */
export default function PumpControlCard({ pumpStatus, controlMode, onToggleMode, onPumpCommand }) {
  const isManual = controlMode === 'manual';
  const isOn = pumpStatus === 'on';

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Pump Status"
        icon={Power}
        iconColorClass={isOn ? 'text-green-500' : 'text-slate-400'}
      />

      <div className="flex-1 flex flex-col justify-between">
        {/* Current state + mode pill */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-bold ${isOn ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {(pumpStatus ?? 'off').toUpperCase()}
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {isOn ? 'Running' : 'Stopped'}
            </div>
          </div>

          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-full text-xs font-bold border transition-colors ${
              isManual
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-300 dark:hover:bg-orange-500/20'
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300 dark:hover:bg-blue-500/20'
            }`}
          >
            {isManual ? <Radio className="w-3 h-3" /> : <Settings2 className="w-3 h-3" />}
            {(controlMode ?? 'auto').toUpperCase()}
          </button>
        </div>

        {/* Manual override controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
            Manual Override
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPumpCommand('on')}
              disabled={!isManual || isOn}
              className={`flex-1 py-3 min-h-[44px] rounded-lg font-bold text-sm transition-colors ${
                !isManual || isOn
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/15 dark:text-green-300 dark:hover:bg-green-500/25'
              }`}
            >
              START
            </button>
            <button
              onClick={() => onPumpCommand('off')}
              disabled={!isManual || !isOn}
              className={`flex-1 py-3 min-h-[44px] rounded-lg font-bold text-sm transition-colors ${
                !isManual || !isOn
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25'
              }`}
            >
              STOP
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
