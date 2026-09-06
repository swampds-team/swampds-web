import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { Card, CardHeader } from '../Card';
import { Sparkline } from '../Sparkline';

const NORMAL_RANGE = { min: 4.4, max: 5.3 }; // L/min

/**
 * Builds a short sparkline from a single current reading,
 * with tight noise appropriate for flow rate values (~4.8 L/min).
 */
function buildSparkline(value) {
  return Array.from({ length: 12 }, (_, i) => ({
    val: +(value + Math.sin(i * 0.8) * 0.05 + (Math.random() * 0.04 - 0.02)).toFixed(2),
  }));
}

/**
 * @param {{
 *   title: string,
 *   value: number,
 *   sublabel: string,
 *   color: string,
 *   iconColorClass: string,
 * }} props
 */
export default function FlowSensorCard({ title, value, sublabel, color, iconColorClass }) {
  const sparkData = useMemo(() => buildSparkline(value ?? 0), [value]);
  const isNormal  = value >= NORMAL_RANGE.min && value <= NORMAL_RANGE.max;

  return (
    <Card>
      <CardHeader title={title} icon={Activity} iconColorClass={iconColorClass} />
      <div className="text-3xl font-bold text-slate-800">
        {(value ?? 0).toFixed(2)}{' '}
        <span className="text-sm font-medium text-slate-500">L/min</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs font-semibold" style={{ color }}>{sublabel}</span>
        <span className={`text-xs font-semibold ${isNormal ? 'text-green-600' : 'text-red-600'}`}>
          {isNormal ? '· Normal' : '· Diverged'}
        </span>
      </div>
      <Sparkline data={sparkData} dataKey="val" color={color} />
    </Card>
  );
}
