import { useState, useEffect, useCallback } from 'react';
import { TANK_STYLES, DEFAULT_TANK_STYLE } from './tankVariants/index.js';

const STORAGE_KEY = 'swampds_tank_style';
const VALID_IDS = new Set(TANK_STYLES.map((s) => s.id));

function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_IDS.has(saved)) return saved;
  } catch { /* storage unavailable */ }
  return DEFAULT_TANK_STYLE;
}

function writeStored(id) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
}

/**
 * The viewer's chosen tank animation style (source/delivery tanks on the pipeline
 * schematic), persisted across visits in this browser.
 * @returns {[string, (id: string) => void]}
 */
export function useTankStyle() {
  const [style, setStyle] = useState(readStored);

  useEffect(() => { writeStored(style); }, [style]);

  const choose = useCallback((id) => {
    if (VALID_IDS.has(id)) setStyle(id);
  }, []);

  return [style, choose];
}
