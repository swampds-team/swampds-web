import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader } from '../Card';

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const LINES = [
  { key: 'F1', name: 'Flow Sensor 1', color: '#10b981' },
  { key: 'F2', name: 'Flow Sensor 2', color: '#f59e0b' },
  { key: 'F3', name: 'Flow Sensor 3', color: '#a855f7' },
];

/**
 * @param {{ data: { time: string, F1: number, F2: number, F3: number }[] }} props
 */
export default function FlowChart({ data }) {
  return (
    <Card>
      <CardHeader title="Flow Rate Overview (24 h)" />
      <div className="h-64 mt-4 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
              domain={[0, 7]}
              tickFormatter={v => `${v}`}
              label={{ value: 'L/min', angle: -90, position: 'insideLeft', offset: 25, style: { fill: '#94a3b8', fontSize: 10 } }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`${v} L/min`]}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {/* Normal operating band */}
            <ReferenceLine y={5.3} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: 'Max normal', position: 'right', fontSize: 9, fill: '#94a3b8' }} />
            <ReferenceLine y={4.4} stroke="#94a3b8" strokeDasharray="4 2" label={{ value: 'Min normal', position: 'right', fontSize: 9, fill: '#94a3b8' }} />
            {LINES.map(({ key, name, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
