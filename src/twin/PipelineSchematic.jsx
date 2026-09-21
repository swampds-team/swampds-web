import React from 'react';

/**
 * Animated pipeline schematic:
 *   SOURCE TANK → PUMP → F1 → VALVE A → F2 → VALVE B → F3 → DELIVERY TANK
 *
 * Laid out horizontally on wide screens and vertically on phones, so the labels
 * stay readable at any width. Glyphs are drawn upright and only positioned by
 * layout; the flow direction is always node 0 → node 7.
 */

const HORIZONTAL = { viewBox: '0 40 960 180', at: (i) => ({ x: 70 + i * 117, y: 100 }) };
const VERTICAL   = { viewBox: '0 0 300 900', at: (i) => ({ x: 70, y: 60 + i * 111 }) };

// Pipe i joins node i → i+1. Pipes 2-3 are segment A (F1→F2), pipes 4-5 are segment B (F2→F3).
const PIPE_SEGMENT = [null, null, 'A', 'A', 'B', 'B', null];

const COLOR = {
  pipe: '#cbd5e1',
  warn: '#f59e0b',
  leak: '#ef4444',
  water: '#38bdf8',
  ink: '#0f172a',
  muted: '#64748b',
};

const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

function Label({ x, y, horizontal, title, lines = [] }) {
  const anchor = horizontal ? 'middle' : 'start';
  const lx = horizontal ? x : x + 50;
  const top = horizontal ? y + 66 : y - 6;
  return (
    <g>
      <text x={lx} y={top} textAnchor={anchor} fontSize="13" fontWeight="700" fill={COLOR.ink}>{title}</text>
      {lines.map((l, i) => (
        <text key={i} x={lx} y={top + 16 * (i + 1)} textAnchor={anchor} fontSize="12" fontWeight={l.bold ? 700 : 400} fill={l.color ?? COLOR.muted}>
          {l.text}
        </text>
      ))}
    </g>
  );
}

function Tank({ x, y, pct, marks = [] }) {
  const w = 64, h = 84, inner = h - 6;
  const fillH = (clamp(pct) / 100) * inner;
  const yAt = (p) => h / 2 - 3 - (p / 100) * inner;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="8" fill="#fff" stroke={COLOR.muted} strokeWidth="3" />
      <rect x={-w / 2 + 3} y={h / 2 - 3 - fillH} width={w - 6} height={fillH} rx="4" fill={COLOR.water} opacity="0.75" />
      {marks.map((m) => (
        <line key={m} x1={-w / 2} x2={w / 2} y1={yAt(m)} y2={yAt(m)} stroke="#475569" strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      <text textAnchor="middle" y="5" fontSize="15" fontWeight="700" fill={COLOR.ink}>{Math.round(pct)}%</text>
    </g>
  );
}

function Pump({ x, y, on }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="27" fill={on ? '#22c55e' : '#94a3b8'} stroke={on ? '#15803d' : COLOR.muted} strokeWidth="3" />
      <text textAnchor="middle" y="6" fontSize="18" fontWeight="700" fill="#fff">P</text>
    </g>
  );
}

function Sensor({ x, y, name }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="22" fill="#fff" stroke="#475569" strokeWidth="3" />
      <text textAnchor="middle" y="5" fontSize="14" fontWeight="700" fill={COLOR.ink}>{name}</text>
    </g>
  );
}

function Valve({ x, y, id, opening, leaking, horizontal }) {
  const open = opening > 0;
  // drips fall downward; keep them clear of the label on each layout
  const drip = horizontal ? { dx: 0, dy: 24 } : { dx: -30, dy: 0 };
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="21" fill={open ? '#fed7aa' : '#e2e8f0'} stroke={open ? '#ea580c' : COLOR.muted} strokeWidth="3" />
      <text textAnchor="middle" y="6" fontSize="17" fontWeight="700" fill={COLOR.ink}>{id}</text>
      {leaking && [0, 0.3, 0.6].map((delay, i) => (
        <circle key={i} className="twin-drip" cx={drip.dx + (i - 1) * 7} cy={drip.dy} r="4" fill={COLOR.water}
          style={{ animationDelay: `${delay}s` }} />
      ))}
    </g>
  );
}

/**
 * @param {{
 *   sim: object,                 engine state
 *   config: object,              engine config (used for the level marks)
 *   relay: 'open'|'closed',
 *   horizontal: boolean,
 * }} props
 */
export default function PipelineSchematic({ sim, config, relay, horizontal }) {
  const layout = horizontal ? HORIZONTAL : VERTICAL;
  const pos = Array.from({ length: 8 }, (_, i) => layout.at(i));
  const { flows, tanks, valves, leakFlow, segments, pumpOn, status } = sim;

  const pipeFlow = [flows.f1, flows.f1, flows.f1, flows.f2, flows.f2, flows.f3, flows.f3];
  const segColor = (id) => {
    if (!id) return COLOR.pipe;
    const seg = segments[id];
    return seg.leak ? COLOR.leak : seg.abnormalFor > 0 ? COLOR.warn : COLOR.pipe;
  };

  const flowLine = (v) => ({ text: `${v.toFixed(2)} L/min`, bold: true, color: COLOR.ink });
  const valveLines = (id) => {
    const lines = [{ text: `${valves[id]}% open` }];
    if (leakFlow[id] > 0.05) lines.push({ text: `Leak ${leakFlow[id].toFixed(2)} L/min`, bold: true, color: COLOR.leak });
    return lines;
  };

  return (
    <svg
      viewBox={layout.viewBox}
      className={horizontal ? 'w-full h-auto' : 'w-full max-w-[320px] mx-auto h-auto'}
      role="img"
      aria-label={`Pipeline schematic. System status ${status}. Pump ${pumpOn ? 'on' : 'off'}. Sensors read ${flows.f1.toFixed(2)}, ${flows.f2.toFixed(2)} and ${flows.f3.toFixed(2)} litres per minute.`}
    >
      {/* pipes (behind the nodes) */}
      {pipeFlow.map((flow, i) => {
        const a = pos[i], b = pos[i + 1];
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={segColor(PIPE_SEGMENT[i])} strokeWidth="12" />
            {flow > 0.05 && (
              <line className="twin-flow" x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={COLOR.water} strokeWidth="4" strokeDasharray="10 18" />
            )}
          </g>
        );
      })}

      {/* nodes */}
      <Tank x={pos[0].x} y={pos[0].y} pct={tanks.source} />
      <Pump x={pos[1].x} y={pos[1].y} on={pumpOn} />
      <Sensor x={pos[2].x} y={pos[2].y} name="F1" />
      <Valve x={pos[3].x} y={pos[3].y} id="A" opening={valves.A} leaking={leakFlow.A > 0.05} horizontal={horizontal} />
      <Sensor x={pos[4].x} y={pos[4].y} name="F2" />
      <Valve x={pos[5].x} y={pos[5].y} id="B" opening={valves.B} leaking={leakFlow.B > 0.05} horizontal={horizontal} />
      <Sensor x={pos[6].x} y={pos[6].y} name="F3" />
      <Tank x={pos[7].x} y={pos[7].y} pct={tanks.delivery} marks={[config.lowLevelPct, config.fullLevelPct]} />

      {/* labels */}
      <Label {...pos[0]} horizontal={horizontal} title="SOURCE TANK" lines={[{ text: 'water supply' }]} />
      <Label {...pos[1]} horizontal={horizontal} title="PUMP"
        lines={[{ text: pumpOn ? 'running' : 'stopped', bold: true, color: pumpOn ? '#15803d' : COLOR.muted }, { text: `relay ${relay}` }]} />
      <Label {...pos[2]} horizontal={horizontal} title="SENSOR F1" lines={[flowLine(flows.f1)]} />
      <Label {...pos[3]} horizontal={horizontal} title="VALVE A" lines={valveLines('A')} />
      <Label {...pos[4]} horizontal={horizontal} title="SENSOR F2" lines={[flowLine(flows.f2)]} />
      <Label {...pos[5]} horizontal={horizontal} title="VALVE B" lines={valveLines('B')} />
      <Label {...pos[6]} horizontal={horizontal} title="SENSOR F3" lines={[flowLine(flows.f3)]} />
      <Label {...pos[7]} horizontal={horizontal} title="DELIVERY TANK" lines={[{ text: 'monitored level' }]} />
    </svg>
  );
}
