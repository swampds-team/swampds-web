/** Wall-clock time for a simulation timestamp, e.g. "10:42:07". */
export function formatClock(startedAt, simSeconds) {
  return new Date(startedAt + simSeconds * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** Elapsed simulation time as mm:ss, used on the chart axis. */
export function formatElapsed(simSeconds) {
  const total = Math.floor(simSeconds);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}
