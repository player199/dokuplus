import { Difficulty } from './sudoku';

const GAME_KEY = 'dokuplus:game:v1';
const SETTINGS_KEY = 'dokuplus:settings:v1';
const STATS_KEY = 'dokuplus:stats:v1';

export type Theme = 'dark' | 'light';

export interface Settings {
  themeId: string; // id into the theme registry (see core/themes.ts)
  mistakeLimit: boolean; // end game after 3 mistakes
  showErrors: boolean; // mark wrong entries in red
  highlightSame: boolean; // highlight matching digits
  autoCleanNotes: boolean; // remove digit from peer notes on placement
  hapticFeedback: boolean;
  scenicFlight: boolean; // plane takes a smooth spatial tour vs. solve order
}

export const DEFAULT_SETTINGS: Settings = {
  themeId: 'flight-deck',
  mistakeLimit: true,
  showErrors: true,
  highlightSame: true,
  autoCleanNotes: true,
  hapticFeedback: true,
  scenicFlight: true,
};

export interface DifficultyStats {
  played: number;
  won: number;
  bestTime: number | null;
  totalTime: number;
  currentStreak: number;
  bestStreak: number;
}

export type Stats = Record<Difficulty, DifficultyStats> & {
  lastDailyCompleted?: string;
  dayStreak?: number; // consecutive days a Daily has been cleared
  bestDayStreak?: number;
  cellsFlown?: number; // total cells FLY has landed for the player
};

const emptyDifficultyStats = (): DifficultyStats => ({
  played: 0,
  won: 0,
  bestTime: null,
  totalTime: 0,
  currentStreak: 0,
  bestStreak: 0,
});

export const emptyStats = (): Stats => ({
  flight: emptyDifficultyStats(),
  daily: emptyDifficultyStats(),
  dayStreak: 0,
  bestDayStreak: 0,
  cellsFlown: 0,
});

// Saved game shape — must stay JSON-serializable.
export interface SavedGame {
  puzzle: number[];
  solution: number[];
  values: number[];
  notes: number[]; // bitmasks
  difficulty: Difficulty;
  dailyDate: string | null;
  mistakes: number;
  hintsUsed: number;
  time: number;
}

const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); the game still works.
  }
};

export const loadSettings = (): Settings => {
  const stored = (read<Partial<Settings> & { theme?: Theme }>(SETTINGS_KEY) ?? {}) as Partial<
    Settings
  > & { theme?: Theme };
  const merged: Settings = { ...DEFAULT_SETTINGS, ...stored };
  // Migrate the old dark/light setting onto the theme registry.
  if (!stored.themeId && stored.theme) {
    merged.themeId = stored.theme === 'light' ? 'daylight' : 'flight-deck';
  }
  return merged;
};

export const saveSettings = (settings: Settings): void => write(SETTINGS_KEY, settings);

export const loadStats = (): Stats => {
  const stored = read<Partial<Stats>>(STATS_KEY);
  const base = emptyStats();
  if (!stored) return base;
  return { ...base, ...stored };
};

export const saveStats = (stats: Stats): void => write(STATS_KEY, stats);

export const loadGame = (): SavedGame | null => {
  const game = read<SavedGame>(GAME_KEY);
  if (!game || !Array.isArray(game.values) || game.values.length !== 81) return null;
  // Migrate saves from the old difficulty tiers onto the new Flight/Daily model.
  if (game.difficulty !== 'daily' && game.difficulty !== 'flight') {
    game.difficulty = game.dailyDate ? 'daily' : 'flight';
  }
  return game;
};

export const saveGame = (game: SavedGame): void => write(GAME_KEY, game);

export const clearSavedGame = (): void => {
  try {
    localStorage.removeItem(GAME_KEY);
  } catch {
    // ignore
  }
};
