import { TankWaveFragment } from './TankWave.jsx';
import { TankBubblesFragment } from './TankBubbles.jsx';
import { TankGlassFragment } from './TankGlass.jsx';
import { TankRippleFragment } from './TankRipple.jsx';

/** All tank animation styles a viewer can choose between, in menu order. */
export const TANK_STYLES = [
  { id: 'wave', name: 'Wave', Fragment: TankWaveFragment },
  { id: 'bubbles', name: 'Bubbles', Fragment: TankBubblesFragment },
  { id: 'glass', name: 'Glass', Fragment: TankGlassFragment },
  { id: 'ripple', name: 'Ripple', Fragment: TankRippleFragment },
];

export const DEFAULT_TANK_STYLE = 'wave';

const BY_ID = Object.fromEntries(TANK_STYLES.map((s) => [s.id, s]));

/** The Fragment component for a style id, falling back to the default if unknown. */
export function getTankFragment(id) {
  return (BY_ID[id] ?? BY_ID[DEFAULT_TANK_STYLE]).Fragment;
}
