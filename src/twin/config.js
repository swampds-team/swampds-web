/**
 * @fileoverview Digital-twin configuration.
 *
 * Every value here is adjustable from the twin page. The detection defaults
 * (tolerancePct, persistSec) are PLACEHOLDERS - the original project spec was
 * not available when this was written. Replace them with the spec's values.
 */

export const DEFAULT_CONFIG = {
  // ── Timing ──────────────────────────────────────────────────────────────
  tickSec: 0.7,            // simulation step (PRD NFR5: ~0.7 s)

  // ── Hydraulics ──────────────────────────────────────────────────────────
  baseFlowLpm: 4.8,        // pump output with no leaks
  maxLeakFraction: 0.6,    // share of upstream flow lost with a valve 100% open
  sourceCapacityL: 12,     // small demo tanks so a full cycle fits in a demo
  deliveryCapacityL: 6,
  deliveryHeightCm: 30,    // only used to report a water depth (cm) to the dashboard

  // ── Sensors ─────────────────────────────────────────────────────────────
  noisePct: 1.5,           // random reading noise, +/- percent
  sensorBiasPct: [0, 0.8, -0.8], // fixed per-sensor calibration error (F1, F2, F3)
  minFlowLpm: 0.5,         // below this upstream flow a segment is not evaluated

  // ── Leak detection (compare-and-persist) ────────────────────────────────
  tolerancePct: 10,        // % difference between neighbouring sensors treated as abnormal
  persistSec: 3,           // abnormal difference must last this long to be a LEAK

  // ── Pump control ────────────────────────────────────────────────────────
  lowLevelPct: 20,         // auto mode: pump ON at or below this delivery level
  fullLevelPct: 95,        // auto mode: pump OFF at or above this delivery level
  sourceEmptyPct: 2,       // pump stops (dry-run protection) at or below this source level

  // ── Display ─────────────────────────────────────────────────────────────
  historyLength: 40,       // samples kept for the rolling flow chart (PRD FR14)
};

/**
 * Smallest valve opening (%) that is reliably flagged as a leak.
 * A valve at `o` % loses o * maxLeakFraction % of the flow, and that loss must beat the
 * tolerance by a small margin to survive sensor noise (measured: ~2 points is enough).
 * Anything smaller stays inside the tolerance and is intentionally NOT reported.
 */
export function reliableLeakOpening(config) {
  const NOISE_MARGIN_PCT = 2;
  return Math.min(100, Math.ceil((config.tolerancePct + NOISE_MARGIN_PCT) / config.maxLeakFraction));
}

/** Human-readable description of each pipe segment. */
export const SEGMENTS = {
  A: { valve: 'A', from: 'F1', to: 'F2', label: 'F1 → F2 (Valve A)' },
  B: { valve: 'B', from: 'F2', to: 'F3', label: 'F2 → F3 (Valve B)' },
};
