import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Sun, Moon } from 'lucide-react';

import TankWave from './tankVariants/TankWave.jsx';
import TankBubbles from './tankVariants/TankBubbles.jsx';
import TankGlass from './tankVariants/TankGlass.jsx';
import TankRipple from './tankVariants/TankRipple.jsx';

const VARIANTS = [
  { id: 'A', name: 'Wave', desc: 'Drifting sine-wave surface, clipped to the fill.', Comp: TankWave },
  { id: 'B', name: 'Bubbles', desc: 'Flat gradient fill with rising bubbles.', Comp: TankBubbles },
  { id: 'C', name: 'Glass gauge', desc: 'Capsule shape, tick marks, moving shine.', Comp: TankGlass },
  { id: 'D', name: 'Minimal ripple', desc: 'Close to current, just a smooth fill + surface line.', Comp: TankRipple },
];

const PRESETS = [8, 20, 50, 80, 95];

/**
 * Not part of the app - a side-by-side comparison of candidate tank animations
 * for the pipeline schematic. Reachable at /tank-lab, not linked from the nav.
 * Delete this file (and the route in App.jsx) once a direction is picked.
 */
export default function TankLab() {
  const [percent, setPercent] = useState(62);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState(true);

  const jumpTo = (v) => setPercent(v);

  return (
    <div className={`${dark ? 'dark' : ''} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-6`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Tank animation lab</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Not part of the app. For comparing candidates.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/twin" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Back to twin</Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="pct" className="text-sm font-medium w-24">Level {Math.round(percent)}%</label>
            <input id="pct" type="range" min="0" max="100" value={percent}
              onChange={(e) => setPercent(Number(e.target.value))} className="twin-range flex-1"
              style={{ '--pct': `${percent}%` }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1"><Play className="w-3 h-3" /> jump to:</span>
            {PRESETS.map((p) => (
              <button key={p} onClick={() => jumpTo(p)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                {p}%
              </button>
            ))}
            <label className="ml-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              pump running (affects bubbles)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VARIANTS.map(({ id, name, desc, Comp }) => (
            <div key={id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
              <span className="text-xs font-bold text-slate-400">{id}</span>
              <Comp percent={percent} active={active} label={name} />
              <p className="text-[11px] text-center text-slate-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 mb-3">At schematic size (~52x68)</p>
          <div className="flex items-end gap-6 flex-wrap">
            {VARIANTS.map(({ id, Comp }) => (
              <Comp key={id} percent={percent} active={active} w={52} h={68} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
