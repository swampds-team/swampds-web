import React from 'react';
import { Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from '../Card';
import { WaterLevelIndicator } from '../WaterLevelIndicator';

const THRESHOLDS = { low: 20, full: 95 };

/**
 * @param {{ percent: number, cm: number }} props
 */
export default function WaterLevelCard({ percent, cm }) {
  const status =
    percent >= THRESHOLDS.full
      ? { label: 'Tank Full', color: 'text-blue-600', Icon: CheckCircle2 }
      : percent <= THRESHOLDS.low
      ? { label: 'Tank Low', color: 'text-red-600', Icon: AlertTriangle }
      : { label: 'Normal', color: 'text-green-600', Icon: CheckCircle2 };

  const { label, color, Icon } = status;

  return (
    <Card>
      <CardHeader title="Water Level" icon={Droplets} iconColorClass="text-blue-500" />
      <div className="flex items-end justify-between mt-2">
        <div>
          <div className="text-4xl font-bold text-blue-600">{percent}%</div>
          <div className="text-sm font-medium text-slate-500 mt-1">{cm} cm</div>
          <div className={`text-xs font-semibold ${color} mt-4 flex items-center gap-1`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </div>
        </div>
        <WaterLevelIndicator percent={percent} />
      </div>
    </Card>
  );
}
