import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

/**
 * Four-state system status banner.
 *
 * Visual distinction guide (for judges/demos):
 *   normal  → solid green,  steady -  "all clear"
 *   warning → amber,        steady -  "pay attention"
 *   leak    → orange-600,   steady -  "action needed"
 *   fault   → red-700,      pulsing - "critical failure"
 *
 * @param {{ systemStatus: 'normal'|'warning'|'leak'|'fault' }} props
 */

const STATUS_CONFIG = {
  fault: {
    bg:       'bg-red-700 animate-pulse',
    text:     'text-white',
    badgeBg:  'bg-red-900/60 text-red-100',
    Icon:     ShieldAlert,
    label:    'SENSOR FAULT',
    desc:     'A flow sensor is reading near-zero - possible sensor failure or full blockage. Manual inspection required immediately.',
  },
  leak: {
    bg:       'bg-orange-600',
    text:     'text-white',
    badgeBg:  'bg-orange-900/50 text-orange-100',
    Icon:     AlertTriangle,
    label:    'LEAK DETECTED',
    desc:     'Flow sensor readings have diverged significantly - pipeline leak suspected. Inspect the marked section.',
  },
  warning: {
    bg:       'bg-amber-500',
    text:     'text-slate-900',
    badgeBg:  'bg-amber-700/30 text-slate-900',
    Icon:     AlertTriangle,
    label:    'SYSTEM WARNING',
    desc:     'Minor flow variation detected between sensors. Monitoring for further divergence.',
  },
  normal: {
    bg:       'bg-green-500',
    text:     'text-white',
    badgeBg:  'bg-green-700/40 text-green-100',
    Icon:     CheckCircle2,
    label:    'SYSTEM NORMAL',
    desc:     'All flow sensors within expected range. No divergence detected.',
  },
};

export default function SystemStatusBanner({ systemStatus }) {
  const cfg = STATUS_CONFIG[systemStatus] ?? STATUS_CONFIG.normal;
  const { bg, text, Icon, label, desc, badgeBg } = cfg;

  return (
    <div
      className={`rounded-2xl p-6 flex items-center gap-5 shadow-md transition-colors duration-500 ${bg} ${text}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1">
        <h2 className="text-2xl font-bold tracking-wide leading-none">{label}</h2>
        <p className="opacity-90 text-sm mt-1">{desc}</p>
      </div>
      <div className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold ${badgeBg}`}>
        {systemStatus.toUpperCase()}
      </div>
    </div>
  );
}
