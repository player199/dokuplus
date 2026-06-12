import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  Difficulty,
  Grid,
  PEERS,
  candidateMask,
  canPlace,
  isComplete,
  maskToDigits,
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
  mistakes: number;
  hintsUsed: number;
  time: number;
  status: GameStatus;
  flying: boolean;
  flyTarget: number | null;
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
  | { type: 'ERASE' }
  | { type: 'TOGGLE_NOTES_MODE' }
  | { type: 'FILL_AUTO_NOTES' }
  | { type: 'UNDO' }
  | { type: 'HINT' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME_PLAY' }
  | { type: 'FLY_START' }
  | { type: 'FLY_STEP'; i: number; digit: number; settings: Settings }
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
  mistakes: 0,
  hintsUsed: 0,
  time: 0,
  status: 'playing',
  flying: false,
  flyTarget: null,
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

  return {
    ...state,
    values,
    notes,
    mistakes,
    status,
    lastPlaced: i,
    flying: status === 'playing' ? state.flying : false,
    flyTarget: status === 'playing' ? state.flyTarget : null,
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

    case 'FILL_AUTO_NOTES': {
      if (state.status !== 'playing' || state.flying) return state;
      const history = pushHistory(state);
      const notes = [...state.notes];
      for (let i = 0; i < 81; i++) {
        if (state.values[i] === 0) notes[i] = candidateMask(state.values, i);
      }
      return { ...state, notes, history };
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
      if (state.status !== 'playing') return state;
      return { ...state, flying: true, notesMode: false };

    case 'FLY_STEP': {
      if (!state.flying || state.status !== 'playing') return state;
      const history = pushHistory(state);
      const next = placeDigit(state, action.i, action.digit, action.settings, true);
      return { ...next, flyTarget: action.i, history };
    }

    case 'FLY_END':
      return { ...state, flying: false, flyTarget: null };

    default:
      return state;
  }
};

// Finds the next cell FLY can fill: a cell whose notes (or computed
// candidates when it has no notes) leave exactly one valid digit.
const findFlyMove = (state: GameState): { i: number; digit: number } | null => {
  for (let i = 0; i < 81; i++) {
    if (state.values[i] !== 0) continue;
    const noted = maskToDigits(state.notes[i]);
    const options = (noted.length > 0 ? noted : maskToDigits(candidateMask(state.values, i)))
      .filter((n) => canPlace(state.values, i, n));
    if (options.length === 1) return { i, digit: options[0] };
  }
  return null;
};

const initialState: GameState = freshState({
  puzzle: new Array(81).fill(0),
  solution: new Array(81).fill(0),
  difficulty: 'easy',
  dailyDate: null,
});

export const useGame = (settings: Settings) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const flyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopFly = useCallback(() => {
    if (flyTimer.current) {
      clearTimeout(flyTimer.current);
      flyTimer.current = null;
    }
    if (stateRef.current.flying) dispatch({ type: 'FLY_END' });
  }, []);

  // FLY mode: cascade-fill every forced cell with accelerating speed.
  const startFly = useCallback(() => {
    const s = stateRef.current;
    if (s.flying || s.status !== 'playing') return;
    if (!findFlyMove(s)) return;

    dispatch({ type: 'FLY_START' });
    let delay = 420;

    const step = () => {
      const current = stateRef.current;
      if (!current.flying || current.status !== 'playing') {
        stopFly();
        return;
      }
      const move = findFlyMove(current);
      if (!move) {
        stopFly();
        return;
      }
      dispatch({ type: 'FLY_STEP', i: move.i, digit: move.digit, settings: settingsRef.current });
      delay = Math.max(65, delay * 0.86);
      flyTimer.current = setTimeout(step, delay);
    };

    flyTimer.current = setTimeout(step, 300);
  }, [stopFly]);

  const toggleFly = useCallback(() => {
    if (stateRef.current.flying) {
      stopFly();
    } else {
      startFly();
    }
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
    erase: () => dispatch({ type: 'ERASE' }),
    toggleNotesMode: () => dispatch({ type: 'TOGGLE_NOTES_MODE' }),
    fillAutoNotes: () => dispatch({ type: 'FILL_AUTO_NOTES' }),
    undo: () => dispatch({ type: 'UNDO' }),
    hint: () => dispatch({ type: 'HINT' }),
    pause: () => {
      stopFly();
      dispatch({ type: 'PAUSE' });
    },
    resumePlay: () => dispatch({ type: 'RESUME_PLAY' }),
    toggleFly,
  };

  return { state, actions };
};

export type GameActions = ReturnType<typeof useGame>['actions'];
