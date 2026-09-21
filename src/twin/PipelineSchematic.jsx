import React from 'react';

/**
 * Modern, Minimalist Vector Pipeline Schematic
 * Clean geometric lines, subtle fluid flow, and clear visual hierarchy.
 */

const HORIZONTAL = {
  viewBox: '0 0 920 180',
  at: (i) => ({ x: 60 + i * 115, y: 80 }),
};

const VERTICAL = {
  viewBox: '0 0 320 540',
  at: (i) => ({ x: 75, y: 44 + i * 64 }),
};

const PIPE_SEGMENT = [null, null, 'A', 'A', 'B', 'B', null];
const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export default function PipelineSchematic({
  sim,
  horizontal,
  onToggleValve,
  onTogglePump,
}) {
  const layout = horizontal ? HORIZONTAL : VERTICAL;
  const pos = Array.from({ length: 8 }, (_, i) => layout.at(i));
  const { flows, tanks, valves, leakFlow, segments, pumpOn } = sim;

  const pipeFlow = [flows.f1, flows.f1, flows.f1, flows.f2, flows.f2, flows.f3, flows.f3];

  const getPipeColor = (segId) => {
    if (!segId) return 'stroke-slate-200 dark:stroke-slate-800';
    const seg = segments[segId];
    if (seg.leak) return 'stroke-rose-500';
    if (seg.abnormalFor > 0) return 'stroke-amber-400';
    return 'stroke-slate-200 dark:stroke-slate-800';
  };

  return (
    <div className="w-full relative select-none py-2">
      <svg
        viewBox={layout.viewBox}
        className={horizontal ? 'w-full h-auto max-h-[220px]' : 'w-full max-w-[320px] mx-auto h-auto'}
        role="img"
        aria-label="Pipeline schematic"
      >
        {/* ── Connecting Pipe Lines ── */}
        {pipeFlow.map((flow, i) => {
          const a = pos[i], b = pos[i + 1];
          const hasFlow = flow > 0.08;
          const segId = PIPE_SEGMENT[i];
          const isLeakingSeg = segId && segments[segId].leak;

          return (
            <g key={i}>
              {/* Background pipe channel */}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={getPipeColor(segId)}
                strokeWidth={isLeakingSeg ? '5' : '4'}
                strokeLinecap="round"
              />
              {/* Active subtle fluid dash */}
              {hasFlow && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 12"
                  strokeLinecap="round"
                  className="fluid-flow"
                />
              )}
            </g>
          );
        })}

        {/* ── Node 0: Source Tank ── */}
        <g transform={`translate(${pos[0].x},${pos[0].y})`}>
          <rect
            x="-26"
            y="-34"
            width="52"
            height="68"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />
          {/* Water Fill */}
          <rect
            x="-24"
            y={32 - (clamp(tanks.source) / 100) * 64}
            width="48"
            height={(clamp(tanks.source) / 100) * 64}
            rx="6"
            className="fill-sky-400/30 dark:fill-sky-500/30"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="12"
            fontWeight="700"
            className="fill-slate-800 dark:fill-slate-100 font-mono"
          >
            {Math.round(tanks.source)}%
          </text>
        </g>

        {/* ── Node 1: Pump ── */}
        <g
          transform={`translate(${pos[1].x},${pos[1].y})`}
          className="cursor-pointer"
          onClick={onTogglePump}
        >
          <circle
            r="22"
            className={
              pumpOn
                ? 'fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-500'
                : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
            }
            strokeWidth="2"
          />
          <path
            d="M -6 -7 L 8 0 L -6 7 Z"
            className={pumpOn ? 'fill-emerald-600' : 'fill-slate-400'}
          />
        </g>

        {/* ── Node 2: Sensor F1 ── */}
        <g transform={`translate(${pos[2].x},${pos[2].y})`}>
          <rect
            x="-24"
            y="-18"
            width="48"
            height="36"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="11"
            fontWeight="700"
            className="fill-blue-600 dark:fill-blue-400 font-mono"
          >
            F1
          </text>
        </g>

        {/* ── Node 3: Valve A ── */}
        <g
          transform={`translate(${pos[3].x},${pos[3].y})`}
          className="cursor-pointer"
          onClick={() => onToggleValve?.('A', valves.A > 0 ? 0 : 25)}
        >
          <circle
            r="18"
            className={
              valves.A > 0
                ? 'fill-amber-50 dark:fill-amber-950/40 stroke-amber-500'
                : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
            }
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="11"
            fontWeight="700"
            className={valves.A > 0 ? 'fill-amber-600 dark:fill-amber-400 font-mono' : 'fill-slate-600 dark:fill-slate-400 font-mono'}
          >
            VA
          </text>
          {/* Subtle drip if leaking */}
          {leakFlow.A > 0.05 && (
            <circle cx={horizontal ? 0 : -30} cy={horizontal ? 24 : 0} r="3" fill="#0284c7" className="gentle-drip" />
          )}
        </g>

        {/* ── Node 4: Sensor F2 ── */}
        <g transform={`translate(${pos[4].x},${pos[4].y})`}>
          <rect
            x="-24"
            y="-18"
            width="48"
            height="36"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="11"
            fontWeight="700"
            className="fill-blue-600 dark:fill-blue-400 font-mono"
          >
            F2
          </text>
        </g>

        {/* ── Node 5: Valve B ── */}
        <g
          transform={`translate(${pos[5].x},${pos[5].y})`}
          className="cursor-pointer"
          onClick={() => onToggleValve?.('B', valves.B > 0 ? 0 : 25)}
        >
          <circle
            r="18"
            className={
              valves.B > 0
                ? 'fill-amber-50 dark:fill-amber-950/40 stroke-amber-500'
                : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
            }
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="11"
            fontWeight="700"
            className={valves.B > 0 ? 'fill-amber-600 dark:fill-amber-400 font-mono' : 'fill-slate-600 dark:fill-slate-400 font-mono'}
          >
            VB
          </text>
          {/* Subtle drip if leaking */}
          {leakFlow.B > 0.05 && (
            <circle cx={horizontal ? 0 : -30} cy={horizontal ? 24 : 0} r="3" fill="#0284c7" className="gentle-drip" />
          )}
        </g>

        {/* ── Node 6: Sensor F3 ── */}
        <g transform={`translate(${pos[6].x},${pos[6].y})`}>
          <rect
            x="-24"
            y="-18"
            width="48"
            height="36"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="11"
            fontWeight="700"
            className="fill-blue-600 dark:fill-blue-400 font-mono"
          >
            F3
          </text>
        </g>

        {/* ── Node 7: Delivery Tank ── */}
        <g transform={`translate(${pos[7].x},${pos[7].y})`}>
          <rect
            x="-26"
            y="-34"
            width="52"
            height="68"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />
          {/* Water Fill */}
          <rect
            x="-24"
            y={32 - (clamp(tanks.delivery) / 100) * 64}
            width="48"
            height={(clamp(tanks.delivery) / 100) * 64}
            rx="6"
            className="fill-sky-400/30 dark:fill-sky-500/30"
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="12"
            fontWeight="700"
            className="fill-slate-800 dark:fill-slate-100 font-mono"
          >
            {Math.round(tanks.delivery)}%
          </text>
        </g>

        {/* ── Minimalist Clean Labels ── */}
        {horizontal ? (
          <>
            {/* Source */}
            <text x={pos[0].x} y="132" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Source</text>

            {/* Pump */}
            <text x={pos[1].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Pump</text>
            <text x={pos[1].x} y="142" textAnchor="middle" fontSize="10" fontWeight="700" className={pumpOn ? 'fill-emerald-600 font-mono' : 'fill-slate-400 font-mono'}>
              {pumpOn ? 'ON' : 'OFF'}
            </text>

            {/* F1 */}
            <text x={pos[2].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Sensor 1</text>
            <text x={pos[2].x} y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className="fill-slate-700 dark:fill-slate-300 font-mono">
              {flows.f1.toFixed(2)} L/m
            </text>

            {/* Valve A */}
            <text x={pos[3].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Valve A</text>
            <text x={pos[3].x} y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className={valves.A > 0 ? 'fill-amber-600 font-mono' : 'fill-slate-400 font-mono'}>
              {valves.A}%
            </text>

            {/* F2 */}
            <text x={pos[4].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Sensor 2</text>
            <text x={pos[4].x} y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className="fill-slate-700 dark:fill-slate-300 font-mono">
              {flows.f2.toFixed(2)} L/m
            </text>

            {/* Valve B */}
            <text x={pos[5].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Valve B</text>
            <text x={pos[5].x} y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className={valves.B > 0 ? 'fill-amber-600 font-mono' : 'fill-slate-400 font-mono'}>
              {valves.B}%
            </text>

            {/* F3 */}
            <text x={pos[6].x} y="128" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Sensor 3</text>
            <text x={pos[6].x} y="142" textAnchor="middle" fontSize="10.5" fontWeight="600" className="fill-slate-700 dark:fill-slate-300 font-mono">
              {flows.f3.toFixed(2)} L/m
            </text>

            {/* Delivery */}
            <text x={pos[7].x} y="132" textAnchor="middle" fontSize="10" fontWeight="600" className="fill-slate-400 uppercase tracking-wider">Delivery</text>
          </>
        ) : (
          /* Vertical Mobile Labels */
          <>
            <text x={pos[0].x + 45} y={pos[0].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">Source Tank ({Math.round(tanks.source)}%)</text>
            <text x={pos[1].x + 45} y={pos[1].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">Pump: {pumpOn ? 'Running' : 'Stopped'}</text>
            <text x={pos[2].x + 45} y={pos[2].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">F1: {flows.f1.toFixed(2)} L/min</text>
            <text x={pos[3].x + 45} y={pos[3].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">Valve A: {valves.A}% open</text>
            <text x={pos[4].x + 45} y={pos[4].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">F2: {flows.f2.toFixed(2)} L/min</text>
            <text x={pos[5].x + 45} y={pos[5].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">Valve B: {valves.B}% open</text>
            <text x={pos[6].x + 45} y={pos[6].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">F3: {flows.f3.toFixed(2)} L/min</text>
            <text x={pos[7].x + 45} y={pos[7].y + 4} fontSize="12" fontWeight="600" className="fill-slate-700 dark:fill-slate-300">Delivery Tank ({Math.round(tanks.delivery)}%)</text>
          </>
        )}
      </svg>
    </div>
  );
}
