/**
 * @fileoverview Internal mock history helpers.
 * NOT a public API - only imported by src/data/swampdsData.js.
 * Delete this file when real Firebase time-series queries are wired in.
 */

/**
 * 24-hour flow rate history for three inline flow sensors.
 * Values stay close together (~4.4–5.4 L/min) under normal conditions.
 * One historical divergence event is baked in around 10 h ago to make
 * the chart immediately interesting during a demo.
 */
export function getFlowChartData() {
  const data = [];
  const now  = new Date();
  let f1 = 4.85, f2 = 4.80, f3 = 4.83;

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);

    // Small hourly drift
    f1 = +Math.max(4.2, Math.min(5.4, f1 + (Math.random() * 0.14 - 0.07))).toFixed(2);
    f2 = +Math.max(4.2, Math.min(5.4, f2 + (Math.random() * 0.14 - 0.07))).toFixed(2);
    f3 = +Math.max(4.2, Math.min(5.4, f3 + (Math.random() * 0.14 - 0.07))).toFixed(2);

    // Simulated divergence event (Sensor 3 dips ~10 hours ago)
    if (i >= 9 && i <= 11) {
      const depth = 10 === i ? 1.9 : 1.1; // peak at middle tick
      f3 = +Math.max(1.8, f3 - depth + Math.random() * 0.2).toFixed(2);
    }

    data.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      F1: f1,
      F2: f2,
      F3: f3,
    });
  }
  return data;
}

export function getWaterLevelChartData() {
  const data = [];
  const now  = new Date();
  let level  = 50;

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    level = Math.max(10, Math.min(100, level + (Math.random() * 20 - 10)));
    data.push({
      time:  t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: Math.round(level),
    });
  }
  return data;
}

/** Pump on/off session log (static mock). */
export function getPumpHistory() {
  return [
    { date: '6 Sep 2026', start: '06:15 AM', end: '08:00 AM', duration: '1h 45m' },
    { date: '5 Sep 2026', start: '10:30 PM', end: '11:55 PM', duration: '1h 25m' },
    { date: '5 Sep 2026', start: '02:00 PM', end: '03:45 PM', duration: '1h 45m' },
    { date: '5 Sep 2026', start: '08:10 AM', end: '09:40 AM', duration: '1h 30m' },
    { date: '4 Sep 2026', start: '11:00 PM', end: '12:20 AM', duration: '1h 20m' },
    { date: '4 Sep 2026', start: '03:15 PM', end: '04:50 PM', duration: '1h 35m' },
    { date: '4 Sep 2026', start: '07:00 AM', end: '08:30 AM', duration: '1h 30m' },
    { date: '3 Sep 2026', start: '09:00 PM', end: '10:10 PM', duration: '1h 10m' },
    { date: '3 Sep 2026', start: '01:00 PM', end: '02:40 PM', duration: '1h 40m' },
    { date: '3 Sep 2026', start: '06:45 AM', end: '08:15 AM', duration: '1h 30m' },
  ];
}
