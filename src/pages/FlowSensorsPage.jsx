import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import { Activity, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { useSwampdsData, useChartHistory } from '../data/swampdsData';

// Expected operating range for each flow sensor
const FLOW_RANGE = { min: 4.4, max: 5.3 }; // L/min

// Leak detection thresholds (must match swampdsData.js logic)
const THRESHOLDS = [
  { label: 'Warning trigger',  value: '≥ 0.4 L/min deviation',  color: 'text-amber-600'  },
  { label: 'Leak trigger',     value: '≥ 1.5 L/min deviation',  color: 'text-orange-600' },
  { label: 'Fault trigger',    value: 'Any sensor < 1.2 L/min', color: 'text-red-600'    },
];

const SENSOR_META = [
  {
    key:      'flow1',
    dataKey:  'F1',
    label:    'Flow Sensor 1 - Inlet',
    color:    '#10b981',
    desc:     'First sensor, immediately after the pump. A low reading indicates upstream blockage or pump failure.',
  },
  {
    key:      'flow2',
    dataKey:  'F2',
    label:    'Flow Sensor 2 - Midpoint',
    color:    '#f59e0b',
    desc:     'Mid-pipeline sensor. Divergence from Sensor 1 indicates a leak in the first pipe section.',
  },
  {
    key:      'flow3',
    dataKey:  'F3',
    label:    'Flow Sensor 3 - Outlet',
    color:    '#a855f7',
    desc:     'End-of-pipe sensor. Divergence from Sensor 2 indicates a leak in the second pipe section.',
  },
];

const STATUS_EXPLANATIONS = {
  normal:  { Icon: CheckCircle2, cls: 'bg-green-50  border-green-200  text-green-800',  iconCls: 'text-green-500',  text: 'All sensors within ±0.3 L/min of each other. No divergence detected.' },
  warning: { Icon: AlertTriangle, cls: 'bg-amber-50  border-amber-200  text-amber-800', iconCls: 'text-amber-500', text: 'One sensor shows mild divergence (0.4–1.4 L/min). This may indicate early-stage flow restriction. Monitoring closely.' },
  leak:    { Icon: AlertTriangle, cls: 'bg-orange-50 border-orange-200 text-orange-800', iconCls: 'text-orange-500', text: 'A sensor is reading 1.5 L/min or more below the others - significant divergence. Pipeline leak is suspected. Inspect immediately.' },
  fault:   { Icon: ShieldAlert,   cls: 'bg-red-50    border-red-200    text-red-800',    iconCls: 'text-red-500',   text: 'A sensor is reading near-zero flow (< 1.2 L/min). This indicates sensor failure or complete blockage. Manual inspection required.' },
};

const TOOLTIP_STYLE = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

function SensorSection({ sensorKey, dataKey, label, color, desc, value, chartData }) {
  const isNormal = value >= FLOW_RANGE.min && value <= FLOW_RANGE.max;
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color }} />
            <h3 className="font-semibold text-slate-700">{label}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-lg leading-snug">{desc}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-3xl font-bold text-slate-800">{(value ?? 0).toFixed(2)}</div>
          <div className="text-xs text-slate-500">L/min</div>
          <span className={`text-xs font-semibold mt-1 inline-block ${isNormal ? 'text-green-600' : 'text-red-600'}`}>
            {isNormal ? '✓ Normal' : '⚠ Diverged'}
          </span>
        </div>
      </div>
      <div className="h-48 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} minTickGap={40} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} domain={[0, 7]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} L/min`]} />
            <ReferenceLine y={FLOW_RANGE.min} stroke="#e2e8f0" strokeDasharray="4 2" />
            <ReferenceLine y={FLOW_RANGE.max} stroke="#e2e8f0" strokeDasharray="4 2" />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function FlowSensorsPage() {
  const { sensors, status } = useSwampdsData();
  const { flowData }        = useChartHistory();

  const statusCfg = STATUS_EXPLANATIONS[status.systemStatus] ?? STATUS_EXPLANATIONS.normal;
  const { Icon: StatusIcon, cls, iconCls, text: statusText } = statusCfg;

  // Live differential stats
  const flows  = [sensors.flow1, sensors.flow2, sensors.flow3].filter(Boolean);
  const avg    = flows.length ? flows.reduce((a, b) => a + b, 0) / flows.length : 0;
  const maxDev = flows.length ? Math.max(...flows.map(v => Math.abs(v - avg))) : 0;

  return (
    <div className="space-y-6">

      {/* System status explanation */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border ${cls}`}>
        <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconCls}`} />
        <div>
          <p className="font-semibold text-sm capitalize">
            {status.systemStatus} - Current System State
          </p>
          <p className="text-sm mt-0.5 opacity-80">{statusText}</p>
        </div>
      </div>

      {/* Individual sensor charts */}
      <div className="space-y-6">
        {SENSOR_META.map(({ key, ...props }) => (
          <SensorSection
            key={key}
            sensorKey={key}
            value={sensors[key]}
            chartData={flowData}
            {...props}
          />
        ))}
      </div>

      {/* Flow readings table + detection thresholds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live readings vs expected range */}
        <Card>
          <CardHeader title="Live Readings vs Expected Range" icon={Activity} iconColorClass="text-slate-400" />
          <p className="text-xs text-slate-400 mb-4">
            Expected operating range: {FLOW_RANGE.min}–{FLOW_RANGE.max} L/min per sensor.
          </p>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                {['Sensor', 'Expected range', 'Live reading', 'Status'].map(h => (
                  <th key={h} className="pb-3 font-medium pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SENSOR_META.map(({ key, label }) => {
                const val = sensors[key] ?? 0;
                const ok  = val >= FLOW_RANGE.min && val <= FLOW_RANGE.max;
                return (
                  <tr key={key} className="border-b border-slate-50 last:border-0 text-slate-700">
                    <td className="py-3 pr-4 font-medium text-xs leading-tight">
                      {label.split(' - ')[0]}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {FLOW_RANGE.min}–{FLOW_RANGE.max} L/min
                    </td>
                    <td className="py-3 pr-4 font-mono font-semibold">
                      {val.toFixed(2)} L/min
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ok ? 'Normal' : 'Diverged'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="text-slate-500 border-t border-slate-100">
                <td className="pt-3 text-xs font-medium" colSpan={2}>
                  Current max deviation from avg
                </td>
                <td className="pt-3 font-mono font-semibold text-sm" colSpan={2}>
                  {maxDev.toFixed(3)} L/min
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Detection thresholds */}
        <Card>
          <CardHeader title="Leak Detection Thresholds" icon={Activity} iconColorClass="text-slate-400" />
          <p className="text-xs text-slate-400 mb-4">
            System evaluates max deviation between all three sensors every 3 seconds.
          </p>
          <div className="space-y-3">
            {THRESHOLDS.map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Thresholds can be adjusted in the Settings page once Firebase persistence is wired in.
          </p>
        </Card>
      </div>

    </div>
  );
}
