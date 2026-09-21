import React from 'react';
import { Cpu, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';

function Led({ on, color, glow, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`w-7 h-7 rounded-full border-2 transition-colors ${on ? `${color} border-transparent ${glow}` : 'bg-slate-100 border-slate-200'}`}
        aria-label={`${label} LED ${on ? 'on' : 'off'}`}
        role="img"
      />
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

/**
 * Simulated hardware outputs: OLED, status LEDs, buzzer and relay.
 * @param {{ outputs: ReturnType<import('./outputs.js').deriveOutputs>, soundOn: boolean, onToggleSound: () => void }} props
 */
export default function HardwarePanel({ outputs, soundOn, onToggleSound }) {
  const { oled, leds, buzzer, relay } = outputs;
  const sounding = buzzer && soundOn;

  return (
    <Card>
      <CardHeader title="Simulated Hardware" icon={Cpu} iconColorClass="text-slate-500" />

      {/* OLED */}
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">OLED display</p>
      <div
        className={`rounded-lg bg-black p-3 font-mono text-xs sm:text-sm leading-relaxed min-h-[7.5rem] ${oled.screen === 'warning' ? 'text-amber-300' : 'text-cyan-200'}`}
        aria-live="off"
      >
        {oled.lines.map((line, i) => (
          <div key={i} className={`truncate ${oled.screen === 'warning' && i === 0 ? 'font-bold' : ''}`}>{line}</div>
        ))}
      </div>

      {/* LEDs */}
      <div className="mt-5 flex items-center justify-around">
        <Led on={leds.green}  color="bg-green-500" glow="shadow-[0_0_12px_2px_rgba(34,197,94,0.6)]"  label="Normal" />
        <Led on={leds.yellow} color="bg-yellow-400" glow="shadow-[0_0_12px_2px_rgba(250,204,21,0.7)]" label="Warning" />
        <Led on={leds.red}    color="bg-red-500"    glow="shadow-[0_0_12px_2px_rgba(239,68,68,0.7)]"  label="Leak" />
      </div>

      {/* Buzzer + relay */}
      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
            <span className={sounding ? 'twin-beep text-red-600' : 'text-slate-400'}>
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </span>
            <span className="font-medium">Buzzer</span>
            <span className={`text-xs font-bold ${buzzer ? 'text-red-600' : 'text-slate-400'}`}>
              {buzzer ? (soundOn ? 'SOUNDING' : 'ACTIVE (muted)') : 'silent'}
            </span>
          </div>
          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className="px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Sound {soundOn ? 'on' : 'off'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Pump relay</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${relay === 'closed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {relay === 'closed' ? 'CLOSED - pump powered' : 'OPEN - pump cut'}
          </span>
        </div>
      </div>
    </Card>
  );
}
