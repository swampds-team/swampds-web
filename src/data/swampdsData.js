/**
 * @fileoverview SWAMPDS Data Layer - the single Firebase swap boundary.
 *
 * PUBLIC API:
 *   useSwampdsData()     → live sensor + status + alerts snapshot
 *   useChartHistory()    → { flowData, waterLevelData } for trend charts
 *   sendPumpCommand(cmd) → write "on" | "off" to the pump command
 *   setControlMode(mode) → write "auto" | "manual" to the control mode
 *   usePumpHistory()     → historical pump on/off event log
 *
 * TO WIRE FIREBASE: replace only the internals of this file.
 *   - setInterval      → onValue(ref(db, '/'), snap => _notify(snap.val()))
 *   - sendPumpCommand  → set(ref(db, 'control/pumpCommand'), cmd)
 *   - setControlMode   → set(ref(db, 'status/controlMode'), mode)
 *   - useChartHistory  → Firebase time-series query
 *   Nothing outside this file needs to change.
 */

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { app } from '../firebase/firebaseConfig';
import { getFlowChartData, getWaterLevelChartData, getPumpHistory } from './mockHistory';

const db = getDatabase(app);

// ── Live store (populated by Firebase onValue) ────────────────────────────────

const initialData = {
  sensors: {
    flow1: 0, flow2: 0, flow3: 0,
    waterLevelPercent: 0, waterLevelCm: 0,
    lastUpdated: Date.now(),
  },
  status:  { systemStatus: 'normal', pumpStatus: 'off', controlMode: 'auto' },
  control: { pumpCommand: 'off' },
  alerts:  [],
};

let _store = { ...initialData };
const _listeners = new Set();

const _notify = (snapshot) => {
  _store = snapshot;
  _listeners.forEach(fn => fn(snapshot));
};

// Subscribe to the entire database root - updates push to all useSwampdsData() consumers
onValue(ref(db, '/'), (snap) => {
  const val = snap.val();
  if (!val) return;

  // Normalise alerts: Firebase stores objects with push-keys, convert to array
  let alerts = [];
  if (val.alerts) {
    if (Array.isArray(val.alerts)) {
      alerts = val.alerts;
    } else {
      alerts = Object.values(val.alerts)
        .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
        .slice(0, 10);
    }
  }

  _notify({
    sensors: val.sensors ?? initialData.sensors,
    status:  val.status  ?? initialData.status,
    control: val.control ?? initialData.control,
    alerts,
  });
});

// ── PUBLIC HOOKS & COMMANDS ───────────────────────────────────────────────────

/**
 * Subscribe to live sensor, status, and alert data.
 * @returns {{ sensors: object, status: object, control: object, alerts: object[] }}
 */
export function useSwampdsData() {
  const [data, setData] = useState(_store);
  useEffect(() => {
    setData(_store);
    _listeners.add(setData);
    return () => _listeners.delete(setData);
  }, []);
  return data;
}

/**
 * Subscribe to historical chart data (24 h rolling window).
 * @returns {{ flowData: object[], waterLevelData: object[] }}
 */
export function useChartHistory() {
  const [history] = useState(() => ({
    flowData:       getFlowChartData(),
    waterLevelData: getWaterLevelChartData(),
  }));
  return history;
}

/**
 * Issue a pump on/off command - writes to Firebase.
 * @param {'on'|'off'} command
 */
export function sendPumpCommand(command) {
  set(ref(db, 'control/pumpCommand'), command);
}

/**
 * Switch between automatic and manual control modes - writes to Firebase.
 * @param {'auto'|'manual'} mode
 */
export function setControlMode(mode) {
  set(ref(db, 'status/controlMode'), mode);
}

/**
 * Fetch historical pump on/off event log.
 * @returns {{ date: string, start: string, end: string, duration: string }[]}
 */
export function usePumpHistory() {
  const [history] = useState(() => getPumpHistory());
  return history;
}
