// Core sudoku engine: boards are flat arrays of 81 numbers, 0 = empty.

export type Grid = number[];

// There are no difficulty tiers any more — every board is a "Flight". The only
// guarantee that matters is that FLY (naked-single propagation) can't finish it
// on its own, so the player always has to make at least one real deduction.
export type Difficulty = 'flight' | 'daily';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  flight: 'Flight',
  daily: 'Daily Flight',
};

// Digging bounds. We stop as soon as the board is FLY-resistant and at/under the
// soft target; if it's still FLY-solvable we keep carving down to the floor.
const SOFT_TARGET = 30;
const MIN_CLUES = 24;

export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

// Precomputed peer indices (same row, column or box) for each cell.
export const PEERS: number[][] = (() => {
  const peers: number[][] = [];
  for (let i = 0; i < 81; i++) {
    const set = new Set<number>();
    for (let j = 0; j < 81; j++) {
      if (j === i) continue;
      if (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i)) {
        set.add(j);
      }
    }
    peers.push([...set]);
  }
  return peers;
})();

export const emptyGrid = (): Grid => new Array(81).fill(0);

export const canPlace = (grid: Grid, i: number, num: number): boolean => {
  for (const p of PEERS[i]) {
    if (grid[p] === num) return false;
  }
  return true;
};

// Bitmask of candidate digits for a cell (bit n-1 set means n is possible).
export const candidateMask = (grid: Grid, i: number): number => {
  if (grid[i] !== 0) return 0;
  let mask = 0b111111111;
  for (const p of PEERS[i]) {
    if (grid[p] !== 0) mask &= ~(1 << (grid[p] - 1));
  }
  return mask;
};

export const maskToDigits = (mask: number): number[] => {
  const digits: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (mask & (1 << (n - 1))) digits.push(n);
  }
  return digits;
};

export const digitsToMask = (digits: number[]): number =>
  digits.reduce((m, n) => m | (1 << (n - 1)), 0);

const popcount = (x: number): number => {
  let count = 0;
  while (x) {
    x &= x - 1;
    count++;
  }
  return count;
};

// Mulberry32 seeded PRNG so daily puzzles are reproducible.
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const dateSeed = (date: Date): number => {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
};

export const dateKey = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};

const shuffle = <T,>(arr: T[], rng: () => number): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Backtracking solver. Fills `grid` in place; returns true if solved.
// Picks the most constrained cell first, which keeps generation fast.
const solveInPlace = (grid: Grid, rng?: () => number): boolean => {
  let best = -1;
  let bestMask = 0;
  let bestCount = 10;
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    const mask = candidateMask(grid, i);
    const count = popcount(mask);
    if (count === 0) return false;
    if (count < bestCount) {
      best = i;
      bestMask = mask;
      bestCount = count;
      if (count === 1) break;
    }
  }
  if (best === -1) return true;

  const digits = maskToDigits(bestMask);
  if (rng) shuffle(digits, rng);
  for (const n of digits) {
    grid[best] = n;
    if (solveInPlace(grid, rng)) return true;
  }
  grid[best] = 0;
  return false;
};

export const solve = (grid: Grid): Grid | null => {
  const copy = [...grid];
  return solveInPlace(copy) ? copy : null;
};

// Counts solutions up to `limit` (used to verify uniqueness).
const countSolutions = (grid: Grid, limit: number): number => {
  let best = -1;
  let bestMask = 0;
  let bestCount = 10;
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    const mask = candidateMask(grid, i);
    const count = popcount(mask);
    if (count === 0) return 0;
    if (count < bestCount) {
      best = i;
      bestMask = mask;
      bestCount = count;
      if (count === 1) break;
    }
  }
  if (best === -1) return 1;

  let total = 0;
  for (const n of maskToDigits(bestMask)) {
    grid[best] = n;
    total += countSolutions(grid, limit - total);
    if (total >= limit) break;
  }
  grid[best] = 0;
  return total;
};

export const hasUniqueSolution = (grid: Grid): boolean => {
  return countSolutions([...grid], 2) === 1;
};

export const generateSolvedGrid = (rng: () => number): Grid => {
  const grid = emptyGrid();
  solveInPlace(grid, rng);
  return grid;
};

// Naked-single propagation — exactly what FLY can do on its own. Returns true
// if repeatedly filling forced cells finishes the whole board.
export const flySolves = (puzzle: Grid): boolean => {
  const g = [...puzzle];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue;
      const mask = candidateMask(g, i);
      if (mask === 0) return false; // contradiction — not solvable as-is
      if (popcount(mask) === 1) {
        g[i] = maskToDigits(mask)[0];
        progress = true;
      }
    }
  }
  return g.every((v) => v !== 0);
};

// True if any empty cell is pinned to a single candidate — i.e. FLY could make
// a move right now. We reject these so a fresh board gives FLY nothing to do
// until the player creates a forced cell through their own deduction.
export const hasNakedSingle = (puzzle: Grid): boolean => {
  for (let i = 0; i < 81; i++) {
    if (puzzle[i] !== 0) continue;
    if (popcount(candidateMask(puzzle, i)) === 1) return true;
  }
  return false;
};

export interface GeneratedPuzzle {
  puzzle: Grid;
  solution: Grid;
}

// Generates a puzzle that keeps a unique solution AND starts with no forced
// cells at all, so FLY is inert until the player makes a genuine deduction.
// (No naked single at the start also means FLY can never finish it in one go.)
export const generatePuzzle = (rng: () => number = Math.random): GeneratedPuzzle => {
  const dig = (): GeneratedPuzzle => {
    const solution = generateSolvedGrid(rng);
    const puzzle = [...solution];
    let clues = 81;
    const order = shuffle(Array.from({ length: 81 }, (_, i) => i), rng);
    for (const i of order) {
      if (clues <= MIN_CLUES) break;
      // Good enough once we're lean and nothing is forced on the opening board.
      if (clues <= SOFT_TARGET && !hasNakedSingle(puzzle)) break;
      const saved = puzzle[i];
      puzzle[i] = 0;
      if (hasUniqueSolution(puzzle)) {
        clues--;
      } else {
        puzzle[i] = saved;
      }
    }
    return { puzzle, solution };
  };

  for (let attempt = 0; attempt < 80; attempt++) {
    const result = dig();
    if (!hasNakedSingle(result.puzzle)) return result;
  }
  // Extremely unlikely fallback.
  return dig();
};

export const isComplete = (values: Grid, solution: Grid): boolean => {
  for (let i = 0; i < 81; i++) {
    if (values[i] !== solution[i]) return false;
  }
  return true;
};

// Counts how many of each digit have been placed (index 1-9).
export const digitCounts = (values: Grid): number[] => {
  const counts = new Array(10).fill(0);
  for (const v of values) counts[v]++;
  return counts;
};
