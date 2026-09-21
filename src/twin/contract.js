/**
 * @fileoverview The Firebase data contract shared by the digital twin and the operator
 * dashboard. Pure functions only (no Firebase, no React) so it is easy to test.
 *
 * WHAT THE TWIN PUBLISHES (acting as the device):
 *   sensors/flow1..flow3, waterLevelPercent, waterLevelCm, lastUpdated   (ms epoch)
 *   system/status      'NORMAL' | 'WARNING' | 'LEAK'
 *   system/pumpState   'ON' | 'OFF'
 *   system/pumpMode    'AUTO' | 'MANUAL'   (mirror of status/controlMode)
 *   system/source      'digital-twin'      (so the dashboard can say the data is simulated)
 *   system/online      true
 *   system/leakSegments  'A' | 'B' | 'A,B'   (absent when there is no leak)
 *   alerts/<pushId>    { time, severity, message, timestamp, source }
 *   pumpHistory/<pushId>  { date, start, end, duration, startTimestamp }
 *   twin/valves/A|B, twin/tolerancePct, twin/persistSec   (informational)
 *   twinLock           { clientId, uid, email, since, heartbeat }   (single-publisher lock)
 *
 * WHAT THE TWIN OBEYS (written by the dashboard):
 *   status/controlMode  'auto' | 'manual'
 *   control/pumpCommand 'on' | 'off'   (only in manual mode)
 */

export const DATA_SOURCE = 'digital-twin';
export const PUBLISH_INTERVAL_MS = 1000;
export const LOCK_TTL_MS = 15_000;      // a lock whose heartbeat is older than this is up for grabs
export const STALE_AFTER_MS = 15_000;   // dashboard: no heartbeat change for this long = offline

const STATUS_TEXT = { normal: 'NORMAL', warning: 'WARNING', leak: 'LEAK' };

const roundTo = (v, digits) => Math.round(v * 10 ** digits) / 10 ** digits;

// ── Snapshot ──────────────────────────────────────────────────────────────────

/** Engine state → the sensor/system/twin nodes the dashboard reads. */
export function toSnapshot(sim, config, now) {
  return {
    sensors: {
      flow1: sim.flows.f1,
      flow2: sim.flows.f2,
      flow3: sim.flows.f3,
      waterLevelPercent: Math.round(sim.tanks.delivery),
      waterLevelCm: roundTo((sim.tanks.delivery / 100) * config.deliveryHeightCm, 1),
      lastUpdated: now,
    },
    system: {
      status: STATUS_TEXT[sim.status] ?? 'NORMAL',
      pumpState: sim.pumpOn ? 'ON' : 'OFF',
      pumpMode: sim.mode.toUpperCase(),
      source: DATA_SOURCE,
      online: true,
      leakSegments: sim.leakSegments.length > 0 ? sim.leakSegments.join(',') : null, // null deletes it
    },
    twin: {
      valves: { A: sim.valves.A, B: sim.valves.B },
      tolerancePct: config.tolerancePct,
      persistSec: config.persistSec,
    },
  };
}

/** Nested object → { 'a/b/c': value } for a multi-path update (null values delete). */
export function flatten(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}/${key}` : key;
    if (value !== null && typeof value === 'object') flatten(value, path, out);
    else out[path] = value;
  }
  return out;
}

// ── Alerts & pump history ─────────────────────────────────────────────────────

/** Warnings, alarms and system messages go to the dashboard; operator clicks on the twin do not. */
export function shouldPublishEvent(event) {
  return event.severity !== 'info' || event.source === 'system';
}

const plain = (text) => text.replace(/ /g, ' '); // ICU uses a narrow no-break space before AM/PM

const fmtTime = (ms) => plain(new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');

/** Engine event → dashboard alert. `timestamp` orders the dashboard's list (newest first). */
export function eventToAlert(event, timestamp) {
  return {
    time: fmtTime(timestamp),
    severity: event.severity,
    message: event.message,
    timestamp,
    source: DATA_SOURCE,
  };
}

/** Seconds → "20m 0s" (or "1h 5m 0s"), the format the pump-history page shows. */
export function formatDuration(totalSec) {
  const sec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

export const createPumpTracker = () => ({ startedAt: null });

/**
 * Watches the pump relay and emits one history row when a run ends.
 * @returns {{ tracker: object, session: object|null }}
 */
export function trackPump(tracker, pumpOn, now) {
  if (pumpOn && tracker.startedAt === null) return { tracker: { startedAt: now }, session: null };
  if (!pumpOn && tracker.startedAt !== null) {
    const start = tracker.startedAt;
    return {
      tracker: { startedAt: null },
      session: {
        date: fmtDate(start),
        start: fmtTime(start),
        end: fmtTime(now),
        duration: formatDuration((now - start) / 1000),
        startTimestamp: start,
      },
    };
  }
  return { tracker, session: null };
}

// ── Commands from the dashboard ───────────────────────────────────────────────

const norm = (v) => (typeof v === 'string' ? v.toLowerCase() : null);

/**
 * What the twin should do about a value the dashboard wrote. Pass only the field that changed.
 * A mode change never also applies the pump command: the twin keeps the pump as it is
 * (bumpless) and republishes its own command, instead of obeying a stale one.
 * @returns {{ type: 'mode'|'command', value: string }[]}
 */
export function controlIntents(sim, remote) {
  const intents = [];
  const mode = norm(remote.controlMode);
  if ((mode === 'auto' || mode === 'manual') && mode !== sim.mode) {
    intents.push({ type: 'mode', value: mode });
    return intents;
  }
  const cmd = norm(remote.pumpCommand);
  if ((cmd === 'on' || cmd === 'off') && sim.mode === 'manual' && cmd !== sim.manualCommand) {
    intents.push({ type: 'command', value: cmd });
  }
  return intents;
}

// ── Single-publisher lock ─────────────────────────────────────────────────────

/** May this client take the lock? Free, already ours, stale, or forced. */
export function canAcquireLock(current, { now, clientId, force = false }) {
  if (!current) return true;
  if (current.clientId === clientId) return true;
  if (force) return true;
  return now - (current.heartbeat ?? 0) > LOCK_TTL_MS;
}

// ── Dashboard side ────────────────────────────────────────────────────────────

/**
 * Should the operator dashboard warn about where its data comes from?
 * `receivedAt` is the LOCAL time the heartbeat last changed, so it does not depend on the
 * two machines' clocks agreeing.
 * @returns {{ kind: 'live'|'simulated'|'offline', simulated: boolean, ageSec: number|null }}
 */
export function describeDataSource(meta, now) {
  const simulated = meta?.source === DATA_SOURCE;
  const age = Number.isFinite(meta?.receivedAt) ? now - meta.receivedAt : null;
  const offline = meta?.online === false || (age !== null && age > STALE_AFTER_MS);
  const ageSec = age === null ? null : Math.round(age / 1000);
  if (offline) return { kind: 'offline', simulated, ageSec };
  if (simulated) return { kind: 'simulated', simulated, ageSec };
  return { kind: 'live', simulated, ageSec };
}
