import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_CONFIG } from './config.js';
import * as engine from './engine.js';

const NOTICE_MS = 4000;

/**
 * Runs the digital-twin engine on a fixed interval and exposes its operator actions.
 * Config changes (tolerance, persistence, ...) apply from the next tick.
 */
export function useTwin() {
  const [sim, setSim]             = useState(() => engine.createInitialState());
  const [config, setConfig]       = useState(DEFAULT_CONFIG);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [notice, setNotice]       = useState(null); // feedback for the last reset attempt

  // Latest values for callbacks/timers that must not be re-created on every tick
  const simRef    = useRef(sim);
  const configRef = useRef(config);
  useEffect(() => { simRef.current = sim; }, [sim]);
  useEffect(() => { configRef.current = config; }, [config]);

  useEffect(() => {
    const id = setInterval(
      () => setSim((s) => engine.step(s, configRef.current)),
      config.tickSec * 1000,
    );
    return () => clearInterval(id);
  }, [config.tickSec]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(id);
  }, [notice]);

  const setValve         = useCallback((id, pct) => setSim((s) => engine.setValve(s, id, pct)), []);
  const setMode          = useCallback((mode, origin) => setSim((s) => engine.setMode(s, mode, origin)), []);
  const setManualCommand = useCallback((cmd, origin) => setSim((s) => engine.setManualCommand(s, cmd, origin)), []);
  const refillSource     = useCallback(() => setSim((s) => engine.refillSource(s)), []);
  const emptyDelivery    = useCallback(() => setSim((s) => engine.emptyDelivery(s)), []);

  const acknowledgeReset = useCallback(() => {
    const result = engine.acknowledgeReset(simRef.current);
    setSim(result.state);
    setNotice(result.ok
      ? { ok: true, text: 'Alarm acknowledged. System reset.' }
      : { ok: false, text: result.reason });
  }, []);

  const updateConfig  = useCallback((patch) => setConfig((c) => ({ ...c, ...patch })), []);
  const resetConfig   = useCallback(() => setConfig(DEFAULT_CONFIG), []);

  const restart = useCallback(() => {
    setSim(engine.createInitialState());
    setStartedAt(Date.now());
    setNotice(null);
  }, []);

  return {
    sim, config, startedAt, notice,
    setValve, setMode, setManualCommand, acknowledgeReset,
    refillSource, emptyDelivery, updateConfig, resetConfig, restart,
  };
}
