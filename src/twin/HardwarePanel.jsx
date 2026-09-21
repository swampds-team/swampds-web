import React from 'react';
import { Cpu, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';

/**
 * Modern Minimalist Hardware Emulator
 * Simulates physical microcontroller outputs (OLED, status LEDs, relay, buzzer)
 * with a clean, understated interface.
 */
export default function HardwarePanel({ outputs, soundOn, onToggleSound }) {
  const { oled, leds, buzzer, relay } = outputs;

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <CardHeader
        title="Hardware Output"
        icon={Cpu}
        iconColorClass="text-slate-500 dark:text-slate-400"
      />

      {/* ── Sleek Minimalist OLED Screen ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span>OLED 128×64 Display</span>
          <span className="font-mono uppercase">{oled.screen}</span>
        </div>

        <div
          className={`rounded-xl p-3.5 font-mono text-xs leading-relaxed transition-colors border ${
            oled.screen === 'warning'
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-cyan-300'
          }`}
          aria-live="polite"
        >
          {oled.lines.map((line, i) => (
            <div key={i} className="truncate">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Indicators (Clean Minimalist Dots) ── */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="text-[11px] font-medium text-slate-400 mb-2">Status Indicators</div>
        <div className="grid grid-cols-3 gap-2">
          {/* Normal */}
          <div
            className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
              leds.green
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                leds.green ? 'bg-emerald-500 ring-2 ring-emerald-400/40' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
            <span>Normal</span>
          </div>

          {/* Warning */}
          <div
            className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
              leds.yellow
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                leds.yellow ? 'bg-amber-400 ring-2 ring-amber-400/40' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
            <span>Warning</span>
          </div>

          {/* Leak */}
          <div
            className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
              leds.red
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 font-semibold'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                leds.red ? 'bg-rose-500 ring-2 ring-rose-400/40' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
            <span>Leak</span>
          </div>
        </div>
      </div>

      {/* ── Actuators (Relay & Buzzer) ── */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        {/* Relay */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">Pump Relay</span>
          <span
            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              relay === 'closed'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {relay === 'closed' ? 'Closed (Powered)' : 'Open (Cutoff)'}
          </span>
        </div>

        {/* Buzzer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">Piezo Buzzer</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[11px] font-semibold ${
                buzzer ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
              }`}
            >
              {buzzer ? (soundOn ? 'Sounding' : 'Muted') : 'Silent'}
            </span>
            <button
              onClick={onToggleSound}
              className="w-10 h-10 -my-2 -mr-2 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title={soundOn ? 'Mute' : 'Unmute'}
              aria-label={soundOn ? 'Mute buzzer' : 'Unmute buzzer'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
