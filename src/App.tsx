import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import SettingsSheet from './components/SettingsSheet';
import { useGame } from './game/useGame';
import { dateKey, dateSeed, generatePuzzle, mulberry32 } from './core/sudoku';
import {
  SavedGame,
  Settings,
  Stats,
  loadGame,
  loadSettings,
  loadStats,
  saveSettings,
  saveStats,
} from './core/storage';

type Screen = 'home' | 'game';

const THEME_COLORS = { dark: '#0b1220', light: '#eef1f8' };

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [saved, setSaved] = useState<SavedGame | null>(loadGame);
  // The puzzle is the landing page — start straight on the board.
  const [screen, setScreen] = useState<Screen>('game');
  const [showSettings, setShowSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const { state: game, actions, canFly } = useGame(settings);

  // Tapping individual candidates inside a cell is a precision interaction —
  // enable it only where there's a real pointer (desktop), not on touch.
  const noteEditable = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    []
  );

  // Bootstrap the landing puzzle once: resume a saved game, otherwise deal a
  // fresh Flight so there's always something to play immediately.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (saved) {
      actions.resumeSaved(saved);
      actions.resumePlay();
    } else {
      const { puzzle, solution } = generatePuzzle(Math.random);
      actions.newGame({ puzzle, solution, difficulty: 'flight', dailyDate: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme to the document and the browser chrome.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[settings.theme]);
  }, [settings.theme]);

  const updateSettings = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const updateStats = useCallback((next: Stats) => {
    setStats(next);
    saveStats(next);
  }, []);

  // Deal a fresh Flight — a puzzle FLY can't finish on its own.
  const startFlight = useCallback(() => {
    setGenerating(true);
    setIsNewBest(false);
    // Defer generation a frame so the loading state can paint.
    setTimeout(() => {
      const { puzzle, solution } = generatePuzzle(Math.random);
      actions.newGame({ puzzle, solution, difficulty: 'flight', dailyDate: null });
      setStats((prev) => {
        const next: Stats = {
          ...prev,
          flight: { ...prev.flight, played: prev.flight.played + 1 },
        };
        saveStats(next);
        return next;
      });
      setGenerating(false);
      setScreen('game');
    }, 60);
  }, [actions]);

  const startDaily = useCallback(() => {
    const todayKey = dateKey(new Date());
    if (saved && saved.dailyDate === todayKey) {
      actions.resumeSaved(saved);
      actions.resumePlay();
      setIsNewBest(false);
      setScreen('game');
      return;
    }
    setGenerating(true);
    setIsNewBest(false);
    setTimeout(() => {
      const rng = mulberry32(dateSeed(new Date()));
      const { puzzle, solution } = generatePuzzle(rng);
      actions.newGame({ puzzle, solution, difficulty: 'daily', dailyDate: todayKey });
      setStats((prev) => {
        const next: Stats = {
          ...prev,
          daily: { ...prev.daily, played: prev.daily.played + 1 },
        };
        saveStats(next);
        return next;
      });
      setGenerating(false);
      setScreen('game');
    }, 60);
  }, [saved, actions]);

  const continueSaved = useCallback(() => {
    if (!saved) return;
    actions.resumeSaved(saved);
    actions.resumePlay();
    setIsNewBest(false);
    setScreen('game');
  }, [saved, actions]);

  const retryPuzzle = useCallback(() => {
    actions.newGame({
      puzzle: game.puzzle,
      solution: game.solution,
      difficulty: game.difficulty,
      dailyDate: game.dailyDate,
    });
    setIsNewBest(false);
  }, [actions, game.puzzle, game.solution, game.difficulty, game.dailyDate]);

  const goHome = useCallback(() => {
    if (game.status === 'playing') actions.pause();
    setSaved(loadGame());
    setScreen('home');
  }, [game.status, actions]);

  // Record results exactly once per finished game.
  const prevStatus = useRef(game.status);
  useEffect(() => {
    const prev = prevStatus.current;
    prevStatus.current = game.status;
    if (prev === game.status) return;

    if (game.status === 'won') {
      const d = game.difficulty;
      const ds = stats[d];
      const newBest = ds.bestTime === null || game.time < ds.bestTime;
      setIsNewBest(newBest);
      const next: Stats = {
        ...stats,
        [d]: {
          ...ds,
          won: ds.won + 1,
          totalTime: ds.totalTime + game.time,
          bestTime: newBest ? game.time : ds.bestTime,
          currentStreak: ds.currentStreak + 1,
          bestStreak: Math.max(ds.bestStreak, ds.currentStreak + 1),
        },
      };
      if (game.dailyDate) next.lastDailyCompleted = game.dailyDate;
      updateStats(next);
      setSaved(null);
    } else if (game.status === 'lost') {
      const d = game.difficulty;
      updateStats({
        ...stats,
        [d]: { ...stats[d], currentStreak: 0 },
      });
      setSaved(null);
    }
  }, [game.status, game.difficulty, game.dailyDate, game.time, stats, updateStats]);

  return (
    <div className="app">
      {screen === 'home' ? (
        <HomeScreen
          saved={saved}
          stats={stats}
          generating={generating}
          onContinue={continueSaved}
          onNewFlight={startFlight}
          onDaily={startDaily}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <GameScreen
          game={game}
          actions={actions}
          settings={settings}
          canFly={canFly}
          noteEditable={noteEditable}
          isNewBest={isNewBest}
          onHome={goHome}
          onNewGame={startFlight}
          onRetry={retryPuzzle}
        />
      )}

      {showSettings && (
        <SettingsSheet
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
