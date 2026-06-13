// Shared board scenarios so the banner and video pose the jet identically.
import { CellSpec } from './components/Grid';
import { SOLUTION, ROUTE, centerOf } from './sudoku';

// Board with the first `landedCount` route cells landed, the next one armed,
// the rest still empty — the canonical "mid-flight" pose.
export function buildHeroCells(landedCount: number): CellSpec[] {
  const landed = new Set(ROUTE.slice(0, landedCount));
  const ahead = new Set(ROUTE.slice(landedCount + 1));
  const armTarget = ROUTE[landedCount];
  return SOLUTION.map((v, i) => {
    if (landed.has(i)) return { v, kind: 'landed' };
    if (i === armTarget) return { v: 0, kind: 'arming' };
    if (ahead.has(i)) return { v: 0, kind: 'empty' };
    return { v, kind: 'given' };
  });
}

export const HERO_PLANE = (boardSize: number, landedCount = 7) => {
  const at = centerOf(ROUTE[landedCount]);
  return {
    x: at.x,
    y: at.y,
    elevation: boardSize * 0.22,
    bank: 40,
    size: boardSize * 0.2,
    contrail: 1,
    glow: 1,
  };
};
