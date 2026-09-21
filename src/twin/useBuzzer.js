import { useEffect } from 'react';

const BEEP_HZ = 880;
const BEEP_EVERY_MS = 600;

/**
 * Sounds a repeating beep while `active` and `enabled` are both true.
 * Uses the Web Audio API, so it needs no audio files. Browsers only allow sound
 * after the user has interacted with the page - which they have by the time a
 * leak is triggered from the on-page controls.
 */
export function useBuzzer(active, enabled) {
  useEffect(() => {
    if (!active || !enabled) return undefined;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return undefined;

    let ctx;
    try {
      ctx = new AudioCtx();
    } catch {
      return undefined;
    }

    const beep = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now  = ctx.currentTime;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = BEEP_HZ;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    };

    beep();
    const id = setInterval(beep, BEEP_EVERY_MS);
    return () => {
      clearInterval(id);
      ctx.close().catch(() => {});
    };
  }, [active, enabled]);
}
