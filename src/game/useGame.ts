import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  Difficulty,
  Grid,
  PEERS,
  candidateMask,
  canPlace,
  colOf,
  isComplete,
  maskToDigits,
  rowOf,
} from '../core/sudoku';
import { SavedGame, Settings, clearSavedGame, saveGame } from '../core/storage';

export const MISTAKE_LIMIT = 3;
const HISTORY_LIMIT = 200;

export type GameStatus = 'playing' | 'paused' | 'won' | 'lost';

interface HistoryEntry {
  values: Grid;
  notes: number[];
}

export interface GameState {
  puzzle: Grid;
  solution: Grid;
  values: Grid;
  notes: number[]; // candidate bitmask per cell
  difficulty: Difficulty;
  dailyDate: string | null;
  selected: number | null;
  notesMode: boolean;
  autoNotes: boolean; // all candidates auto-filled (toggle state of the Auto tool)
  mistakes: number;
  hintsUsed: number;
  time: number;
  status: GameStatus;
  flying: boolean;
  flyTarget: number | null;
  flyRoute: { i: number; digit: number }[]; // precomputed cascade for the flight
  flyIndex: number; // how many of the route have landed
  lastPlaced: number | null;
  history: HistoryEntry[];
}

interface NewGamePayload {
  puzzle: Grid;
  solution: Grid;
  difficulty: Difficulty;
  dailyDate: string | null;
}

type Action =
  | { type: 'NEW_GAME'; payload: NewGamePayload }
  | { type: 'RESUME'; payload: SavedGame }
  | { type: 'SELECT'; i: number | null }
  | { type: 'INPUT'; digit: number; settings: Settings }
  | { type: 'TOGGLE_NOTE'; i: number; digit: number }
  | { type: 'ERASE' }
  | { type: 'TOGGLE_NOTES_MODE' }
  | { type: 'TOGGLE_AUTO_NOTES' }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME_PLAY' }
  | { type: 'FLY_START'; route: { i: number; digit: number }[] }
  | { type: 'FLY_LAND'; settings: Settings }
  | { type: 'FLY_END' };

const freshState = (payload: NewGamePayload): GameState => ({
  puzzle: [...payload.puzzle],
  solution: [...payload.solution],
  values: [...payload.puzzle],
  notes: new Array(81).fill(0),
  difficulty: payload.difficulty,
  dailyDate: payload.dailyDate,
  selected: null,
  notesMode: false,
  autoNotes: false,
  mistakes: 0,
  hintsUsed: 0,
  time: 0,
  status: 'playing',
  flying: false,
  flyTarget: null,
  flyRoute: [],
  flyIndex: 0,
  lastPlaced: null,
  history: [],
});

const pushHistory = (state: GameState): HistoryEntry[] => {
  const entry = { values: [...state.values], notes: [...state.notes] };
  const history = [...state.history, entry];
  return history.length > HISTORY_LIMIT ? history.slice(-HISTORY_LIMIT) : history;
};

// Places a digit and applies all side effects (note cleanup, mistakes, win check).
const placeDigit = (
  state: GameState,
  i: number,
  digit: number,
  settings: Settings,
  countMistakes: boolean
): GameState => {
  const values = [...state.values];
  const notes = [...state.notes];
  values[i] = digit;
  notes[i] = 0;

  if (settings.autoCleanNotes) {
    const bit = 1 << (digit - 1);
    for (const p of PEERS[i]) notes[p] &= ~bit;
  }

  let mistakes = state.mistakes;
  let status: GameStatus = state.status;
  const wrong = digit !== state.solution[i];

  if (wrong && countMistakes && (settings.mistakeLimit || settings.showErrors)) {
    mistakes += 1;
    if (settings.mistakeLimit && mistakes >= MISTAKE_LIMIT) {
      status = 'lost';
    }
  }

  if (status !== 'lost' && isComplete(values, state.solution)) {
    status = 'won';
  }

  // On a win, let an in-progress flight finish its pass (the controller ends it
  // via FLY_END); only a loss cancels the flight outright.
  const keepFlight = status !== 'lost';
  return {
    ...state,
    values,
    notes,
    mistakes,
    status,
    lastPlaced: i,
    flying: keepFlight ? state.flying : false,
    flyTarget: keepFlight ? state.flyTarget : null,
    flyRoute: keepFlight ? state.flyRoute : [],
    flyIndex: keepFlight ? state.flyIndex : 0,
  };
};

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'NEW_GAME':
      return freshState(action.payload);

    case 'RESUME': {
      const s = action.payload;
      return {
        ...freshState({
          puzzle: s.puzzle,
          solution: s.solution,
          difficulty: s.difficulty,
          dailyDate: s.dailyDate,
        }),
        values: [...s.values],
        notes: [...s.notes],
        mistakes: s.mistakes,
        hintsUsed: s.hintsUsed,
        time: s.time,
        status: 'paused',
      };
    }

    case 'SELECT':
      if (state.status === 'won' || state.status === 'lost') return state;
      return { ...state, selected: action.i };

    case 'INPUT': {
      if (state.status !== 'playing' || state.flying) return state;
      const i = state.selected;
      if (i === null || state.puzzle[i] !== 0) return state;

      if (state.notesMode) {
        if (state.values[i] !== 0) return state;
        const notes = [...state.notes];
        notes[i] ^= 1 << (action.digit - 1);
        return { ...state, notes, history: pushHistory(state) };
      }

      // Tapping the digit already in the cell removes it.
      if (state.values[i] === action.digit) {
        const values = [...state.values];
        values[i] = 0;
        return { ...state, values, lastPlaced: null, history: pushHistory(state) };
      }

      const history = pushHistory(state);
      return { ...placeDigit(state, i, action.digit, action.settings, true), history };
    }

    case 'TOGGLE_NOTE': {
      // Direct pencil-mark toggle by tapping a candidate inside a cell (desktop).
      if (state.status !== 'playing' || state.flying) return state;
      const { i, digit } = action;
      if (state.puzzle[i] !== 0 || state.values[i] !== 0) return state;
      const notes = [...state.notes];
      notes[i] ^= 1 << (digit - 1);
      return { ...state, notes, selected: i, history: pushHistory(state) };
    }

    case 'ERASE': {
      if (state.status !== 'playing' || state.flying) return state;
      const i = state.selected;
      if (i === null || state.puzzle[i] !== 0) return state;
      if (state.values[i] === 0 && state.notes[i] === 0) return state;
      const values = [...state.values];
      const notes = [...state.notes];
      const history = pushHistory(state);
      values[i] = 0;
      notes[i] = 0;
      return { ...state, values, notes, lastPlaced: null, history };
    }

    case 'TOGGLE_NOTES_MODE':
      return { ...state, notesMode: !state.notesMode };

    case 'TOGGLE_AUTO_NOTES': {
      if (state.status !== 'playing' || state.flying) return state;
      const history = pushHistory(state);
      // On → clear every pencil mark; the Auto tool turns itself off.
      if (state.autoNotes) {
        return { ...state, notes: new Array(81).fill(0), autoNotes: false, history };
      }
      // Off → fill every empty cell with its current candidates.
      const notes = [...state.notes];
      for (let i = 0; i < 81; i++) {
        if (state.values[i] === 0) notes[i] = candidateMask(state.values, i);
      }
      return { ...state, notes, autoNotes: true, history };
    }

    case 'UNDO': {
      if (state.status !== 'playing' || state.flying) return state;
      const history = [...state.history];
      const entry = history.pop();
      if (!entry) return state;
      return { ...state, values: entry.values, notes: entry.notes, history, lastPlaced: null };
    }

    case 'HINT': {
      if (state.status !== 'playing' || state.flying) return state;
      let i = state.selected;
      const needsHint = (idx: number) =>
        state.puzzle[idx] === 0 && state.values[idx] !== state.solution[idx];
      if (i === null || !needsHint(i)) {
        const open: number[] = [];
        for (let idx = 0; idx < 81; idx++) if (needsHint(idx)) open.push(idx);
        if (open.length === 0) return state;
        i = open[Math.floor(Math.random() * open.length)];
      }
      const history = pushHistory(state);
      const next = placeDigit(
        state,
        i,
        state.solution[i],
        { autoCleanNotes: true } as Settings,
        false
      );
      return { ...next, selected: i, hintsUsed: state.hintsUsed + 1, history };
    }

    case 'TICK':
      if (state.status !== 'playing') return state;
      return { ...state, time: state.time + 1 };

    case 'PAUSE':
      if (state.status !== 'playing') return state;
      return { ...state, status: 'paused', flying: false, flyTarget: null };

    case 'RESUME_PLAY':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'playing' };

    case 'FLY_START':
      if (state.status !== 'playing' || action.route.length === 0) return state;
      return {
        ...state,
        flying: true,
        notesMode: false,
        flyRoute: action.route,
        flyIndex: 0,
        flyTarget: null,
      };

    case 'FLY_LAND': {
      if (!state.flying || state.status !== 'playing') return state;
      const move = state.flyRoute[state.flyIndex];
      if (!move) return state;
      const history = pushHistory(state);
      const next = placeDigit(state, move.i, move.digit, action.settings, true);
      return { ...next, flyTarget: move.i, flyIndex: state.flyIndex + 1, history };
    }

    case 'FLY_END':
      return { ...state, flying: false, flyTarget: null, flyRoute: [], flyIndex: 0 };

    default:
      return state;
  }
};

// A cell FLY can fill: its notes (or computed candidates when it has none)
// leave exactly one valid digit.
const forcedMove = (
  values: Grid,
  notes: number[],
  i: number
): number | null => {
  const noted = maskToDigits(notes[i]);
  const options = (noted.length > 0 ? noted : maskToDigits(candidateMask(values, i))).filter((n) =>
    canPlace(values, i, n)
  );
  return options.length === 1 ? options[0] : null;
};

const findFlyMove = (state: GameState): { i: number; digit: number } | null => {
  for (let i = 0; i < 81; i++) {
    if (state.values[i] !== 0) continue;
    const digit = forcedMove(state.values, state.notes, i);
    if (digit !== null) return { i, digit };
  }
  return null;
};

// Plays the whole cascade forward to build the flight route up front, so the
// plane can fly a continuous path and land each cell as it passes over it.
const planFlyRoute = (state: GameState): { i: number; digit: number }[] => {
  const values = [...state.values];
  const route: { i: number; digit: number }[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < 81; i++) {
      if (values[i] !== 0) continue;
      const digit = forcedMove(values, state.notes, i);
      if (digit !== null) {
        route.push({ i, digit });
        values[i] = digit;
        progress = true;
      }
    }
  }
  return route;
};

// Reorders the same set of forced cells into a boustrophedon ("lawnmower")
// sweep — the way a survey/crop-duster plane covers a field: straight passes
// row by row, alternating direction so each pass ends near where the next
// begins, leaving only smooth U-turns at the edges (no erratic sharp turns).
// The flight controller's spline then rounds those turns into banked arcs.
// Every cell's digit is fixed regardless of order, so this is purely cosmetic.
const orderScenic = (route: { i: number; digit: number }[]): { i: number; digit: number }[] => {
  if (route.length <= 2) return route;

  const byRow = new Map<number, { i: number; digit: number }[]>();
  for (const m of route) {
    const r = rowOf(m.i);
    const arr = byRow.get(r);
    if (arr) arr.push(m);
    else byRow.set(r, [m]);
  }

  const rows = [...byRow.keys()].sort((a, b) => a - b);
  const ordered: { i: number; digit: number }[] = [];
  rows.forEach((r, pass) => {
    const cells = byRow.get(r)!.sort((a, b) => colOf(a.i) - colOf(b.i));
    if (pass % 2 === 1) cells.reverse(); // sweep back the other way
    ordered.push(...cells);
  });
  return ordered;
};

const initialState: GameState = freshState({
  puzzle: new Array(81).fill(0),
  solution: new Array(81).fill(0),
  difficulty: 'flight',
  dailyDate: null,
});

export const useGame = (settings: Settings) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Launch a flight by planning the full cascade route; the flight controller in
  // the Board then flies the plane and drives the landings.
  const startFly = useCallback(() => {
    const s = stateRef.current;
    if (s.flying || s.status !== 'playing') return;
    let route = planFlyRoute(s);
    if (route.length === 0) return;
    if (settingsRef.current.scenicFlight) route = orderScenic(route);
    dispatch({ type: 'FLY_START', route });
  }, []);

  const stopFly = useCallback(() => {
    if (stateRef.current.flying) dispatch({ type: 'FLY_END' });
  }, []);

  const toggleFly = useCallback(() => {
    if (stateRef.current.flying) stopFly();
    else startFly();
  }, [startFly, stopFly]);

  useEffect(() => stopFly, [stopFly]);

  // Game clock: ticks while playing, auto-pauses when the tab is hidden.
  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: 'PAUSE' });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [state.status]);

  // Auto-save the game so players can always resume.
  useEffect(() => {
    if (state.status === 'playing' || state.status === 'paused') {
      if (state.solution[0] === 0) return; // no game loaded yet
      saveGame({
        puzzle: state.puzzle,
        solution: state.solution,
        values: state.values,
        notes: state.notes,
        difficulty: state.difficulty,
        dailyDate: state.dailyDate,
        mistakes: state.mistakes,
        hintsUsed: state.hintsUsed,
        time: state.time,
      });
    } else if (state.status === 'won' || state.status === 'lost') {
      clearSavedGame();
    }
  }, [state]);

  const actions = {
    newGame: (payload: NewGamePayload) => {
      stopFly();
      dispatch({ type: 'NEW_GAME', payload });
    },
    resumeSaved: (saved: SavedGame) => dispatch({ type: 'RESUME', payload: saved }),
    select: (i: number | null) => dispatch({ type: 'SELECT', i }),
    input: (digit: number) => dispatch({ type: 'INPUT', digit, settings: settingsRef.current }),
    toggleNote: (i: number, digit: number) => dispatch({ type: 'TOGGLE_NOTE', i, digit }),
    erase: () => dispatch({ type: 'ERASE' }),
    toggleNotesMode: () => dispatch({ type: 'TOGGLE_NOTES_MODE' }),
    toggleAutoNotes: () => dispatch({ type: 'TOGGLE_AUTO_NOTES' }),
    undo: () => dispatch({ type: 'UNDO' }),
    hint: () => dispatch({ type: 'HINT' }),
    pause: () => {
      stopFly();
      dispatch({ type: 'PAUSE' });
    },
    resumePlay: () => dispatch({ type: 'RESUME_PLAY' }),
    toggleFly,
    flyLand: () => dispatch({ type: 'FLY_LAND', settings: settingsRef.current }),
    endFly: () => dispatch({ type: 'FLY_END' }),
  };

  // Whether FLY has at least one forced cell to land right now — drives the
  // "armed" state of the FLY button so the player always knows if it'll do
  // anything before pressing it.
  const canFly = state.status === 'playing' && !state.flying && findFlyMove(state) !== null;

  return { state, actions, canFly };
};

export type GameActions = ReturnType<typeof useGame>['actions'];
