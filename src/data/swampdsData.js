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
import { getFlowChartData, getWaterLevelChartData, getPumpHistory } from './mockHistory';

// ── Mock store ────────────────────────────────────────────────────────────────

const initialData = {
  sensors: {
    flow1: 4.82,
    flow2: 4.76,
    flow3: 4.78,
    waterLevelPercent: 72,
    waterLevelCm: 34,
    lastUpdated: Date.now(),
  },
  status: {
    systemStatus: 'normal', // 'normal' | 'warning' | 'leak' | 'fault'
    pumpStatus:   'on',     // 'on' | 'off'
    controlMode:  'auto',   // 'auto' | 'manual'
  },
  control: {
    pumpCommand: 'on',
  },
  alerts: [
    { time: '10:25 AM', severity: 'critical', message: 'Flow Sensor 3 reading diverged from Sensor 1/2 - possible leak downstream' },
    { time: '10:18 AM', severity: 'warning',  message: 'Minor flow variation on Sensor 2. Continuing to monitor.' },
    { time: '10:15 AM', severity: 'info',     message: 'Pump automatically started (low water level)' },
  ],
};

let _store = {
  ...initialData,
  sensors: { ...initialData.sensors },
  status:  { ...initialData.status  },
};
const _listeners = new Set();

const _notify = () => {
  const snapshot = {
    ..._store,
    sensors: { ..._store.sensors },
    status:  { ..._store.status  },
  };
  _listeners.forEach(fn => fn(snapshot));
};

// ── Flow divergence simulation state ─────────────────────────────────────────

// Calibrated "at rest" flow rates for each sensor
const FLOW_BASELINE = { flow1: 4.85, flow2: 4.80, flow3: 4.83 };

let _prevSystemStatus = 'normal';
let _divergeActive   = false;
let _divergeSensor   = 0;   // 1, 2, or 3
let _divergeAmount   = 0;   // L/min drop at peak of event
let _divergeTick     = 0;
let _divergeDuration = 0;

setInterval(() => {
  // ── Normal drift: tiny random noise around last reading ──
  let flow1 = +(_store.sensors.flow1 + (Math.random() * 0.06 - 0.03)).toFixed(2);
  let flow2 = +(_store.sensors.flow2 + (Math.random() * 0.06 - 0.03)).toFixed(2);
  let flow3 = +(_store.sensors.flow3 + (Math.random() * 0.06 - 0.03)).toFixed(2);

  // Pull gently toward baseline to prevent unbounded drift
  if (!_divergeActive) {
    flow1 = +(flow1 * 0.85 + FLOW_BASELINE.flow1 * 0.15).toFixed(2);
    flow2 = +(flow2 * 0.85 + FLOW_BASELINE.flow2 * 0.15).toFixed(2);
    flow3 = +(flow3 * 0.85 + FLOW_BASELINE.flow3 * 0.15).toFixed(2);
  }

  // ── Start a divergence event (~4% chance per 3 s tick → ~every 75 s avg) ──
  if (!_divergeActive && Math.random() < 0.04) {
    _divergeActive   = true;
    _divergeSensor   = [1, 2, 3][Math.floor(Math.random() * 3)];
    _divergeAmount   = 2.0 + Math.random() * 1.5; // 2.0–3.5 L/min drop at peak
    _divergeTick     = 0;
    _divergeDuration = 8 + Math.floor(Math.random() * 6); // 8–13 ticks (24–39 s)
  }

  // ── Apply divergence - bell-curve shape: sin(πt/T) ramp-up then recovery ──
  if (_divergeActive) {
    _divergeTick++;
    const progress   = _divergeTick / _divergeDuration;
    const dropFactor = Math.sin(progress * Math.PI); // 0 → 1 → 0 over event
    const actualDrop = _divergeAmount * dropFactor;

    const base = FLOW_BASELINE;
    if (_divergeSensor === 1) flow1 = +(Math.max(0.5, base.flow1 - actualDrop)).toFixed(2);
    if (_divergeSensor === 2) flow2 = +(Math.max(0.5, base.flow2 - actualDrop)).toFixed(2);
    if (_divergeSensor === 3) flow3 = +(Math.max(0.5, base.flow3 - actualDrop)).toFixed(2);

    if (_divergeTick >= _divergeDuration) _divergeActive = false;
  }

  // ── Derive systemStatus from flow differential ──
  const flows   = [flow1, flow2, flow3];
  const avg     = flows.reduce((a, b) => a + b, 0) / 3;
  const maxDev  = Math.max(...flows.map(v => Math.abs(v - avg)));
  const minFlow = Math.min(...flows);

  let systemStatus = 'normal';
  if (minFlow < 1.2)      systemStatus = 'fault';   // near-zero → sensor failure
  else if (maxDev >= 1.5) systemStatus = 'leak';    // significant divergence
  else if (maxDev >= 0.4) systemStatus = 'warning'; // mild divergence

  // ── Water level (unchanged logic) ──
  const pct = Math.max(0, Math.min(100, Math.round(
    _store.sensors.waterLevelPercent + (_store.status.pumpStatus === 'on' ? 1 : -0.5),
  )));

  _store = {
    ..._store,
    sensors: {
      ..._store.sensors,
      flow1, flow2, flow3,
      waterLevelPercent: pct,
      waterLevelCm:      Math.round(pct * 0.5),
      lastUpdated:       Date.now(),
    },
    status: { ..._store.status, systemStatus },
  };

  // ── Generate alerts on systemStatus transitions ──
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (systemStatus !== _prevSystemStatus) {
    const sn = _divergeSensor || '?';
    if (systemStatus === 'fault') {
      _store.alerts = [
        { time: now, severity: 'critical', message: `Flow Sensor ${sn} reading near zero - sensor fault suspected. Inspect immediately.` },
        ..._store.alerts,
      ].slice(0, 10);
    } else if (systemStatus === 'leak') {
      _store.alerts = [
        { time: now, severity: 'critical', message: `Flow Sensor ${sn} diverged by >${(maxDev).toFixed(1)} L/min - pipeline leak suspected` },
        ..._store.alerts,
      ].slice(0, 10);
    } else if (systemStatus === 'warning') {
      _store.alerts = [
        { time: now, severity: 'warning', message: `Flow Sensor ${sn} showing mild variation (${maxDev.toFixed(2)} L/min). Monitoring.` },
        ..._store.alerts,
      ].slice(0, 10);
    }
    _prevSystemStatus = systemStatus;
  }

  // ── Auto pump logic ──
  if (_store.status.controlMode === 'auto') {
    if (pct < 20 && _store.status.pumpStatus === 'off') {
      _store.status  = { ..._store.status, pumpStatus: 'on' };
      _store.control = { pumpCommand: 'on' };
      _store.alerts  = [{ time: now, severity: 'info', message: 'Pump automatically started (low water level)' }, ..._store.alerts].slice(0, 10);
    } else if (pct > 95 && _store.status.pumpStatus === 'on') {
      _store.status  = { ..._store.status, pumpStatus: 'off' };
      _store.control = { pumpCommand: 'off' };
      _store.alerts  = [{ time: now, severity: 'info', message: 'Pump automatically stopped (tank full)' }, ..._store.alerts].slice(0, 10);
    }
  }

  _notify();
}, 3000);

// ── PUBLIC HOOKS & COMMANDS ───────────────────────────────────────────────────

/**
 * Subscribe to live sensor, status, and alert data.
 * @returns {{ sensors: object, status: object, control: object, alerts: object[] }}
 */
export function useSwampdsData() {
  const [data, setData] = useState(_store);
  useEffect(() => {
    setData({ ..._store, sensors: { ..._store.sensors }, status: { ..._store.status } });
    _listeners.add(setData);
    return () => _listeners.delete(setData);
  }, []);
  return data;
}

/**
 * Subscribe to historical chart data (24 h rolling window).
 * Firebase swap: replace useState body with a time-series onValue query.
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
 * Issue a pump on/off command.
 * Firebase swap: set(ref(db, 'control/pumpCommand'), command)
 * @param {'on'|'off'} command
 */
export function sendPumpCommand(command) {
  _store = {
    ..._store,
    control: { pumpCommand: command },
    status:  { ..._store.status, pumpStatus: command },
  };
  _notify();
}

/**
 * Switch between automatic and manual control modes.
 * Firebase swap: set(ref(db, 'status/controlMode'), mode)
 * @param {'auto'|'manual'} mode
 */
export function setControlMode(mode) {
  _store = {
    ..._store,
    status: { ..._store.status, controlMode: mode },
  };
  _notify();
}

/**
 * Fetch historical pump on/off event log.
 * Firebase swap: replace useState body with a Firebase query.
 * @returns {{ date: string, start: string, end: string, duration: string }[]}
 */
export function usePumpHistory() {
  const [history] = useState(() => getPumpHistory());
  return history;
}
