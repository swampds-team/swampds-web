import React from 'react';

/** Number of recorded samples needed before a trend line is worth drawing. */
export const MIN_CHART_POINTS = 2;

/**
 * Shown in place of a chart until enough live readings have been recorded.
 * @param {{ className?: string }} props
 */
export default function ChartPlaceholder({ className = 'h-64 sm:h-72 mt-4' }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-1 text-center text-slate-400`}>
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <p className="text-sm font-medium">Collecting data…</p>
      <p className="text-xs max-w-xs">
        Trends are built from live readings while this app is open. The chart appears after a minute or so.
      </p>
    </div>
  );
}
