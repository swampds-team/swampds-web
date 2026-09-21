/**
 * Fault injection and demonstration presets for SWAMPDS Digital Twin.
 * Supports rapid live demonstrations and capstone grading evaluation.
 */

export const DEMO_PRESETS = [
  {
    id: 'normal',
    title: 'Normal Pumping',
    badge: 'Baseline',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    description: 'All valves sealed (0%). System automatically fills delivery tank within normal sensor tolerance.',
    apply: (twin) => {
      twin.setValve('A', 0);
      twin.setValve('B', 0);
      twin.setMode('auto');
      twin.refillSource();
    },
  },
  {
    id: 'slow_leak_a',
    title: 'Slow Leak (Section A)',
    badge: '15% loss',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: 'Valve A opened 25% (about 15% of the flow lost). Exceeds the tolerance, so it goes through the warning phase and persistence countdown.',
    apply: (twin) => {
      twin.setValve('B', 0);
      twin.setValve('A', 25);
    },
  },
  {
    id: 'burst_leak_b',
    title: 'Catastrophic Burst (Section B)',
    badge: '39% loss',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    description: 'Valve B opened 65%. Severe downstream drop between F2 and F3 triggering rapid leak shutdown.',
    apply: (twin) => {
      twin.setValve('A', 0);
      twin.setValve('B', 65);
    },
  },
  {
    id: 'dual_leak',
    title: 'Multi-Segment Rupture',
    badge: 'A+B Leak',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    description: 'Both Valve A (25%) and Valve B (45%) opened. Verifies multi-segment isolation logic.',
    apply: (twin) => {
      twin.setValve('A', 25);
      twin.setValve('B', 45);
    },
  },
];
