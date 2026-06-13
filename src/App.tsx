import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import SettingsSheet from './components/SettingsSheet';
import Onboarding from './components/Onboarding';
import ReviewPrompt from './components/ReviewPrompt';
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
import { applyTheme, getTheme } from './core/themes';
import { hasSeenOnboarding, hasBeenPromptedForReview, markReviewPrompted } from './core/meta';

type Screen = 'home' | 'game';

function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [saved, setSaved] = useState<SavedGame | null>(loadGame);
  // The puzzle is the landing page — start straight on the board.
  const [screen, setScreen] = useState<Screen>('game');
  const [showSettings, setShowSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

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

  // Apply the selected theme's palette to the document and browser chrome.
  useLayoutEffect(() => {
    const theme = getTheme(settings.themeId);
    applyTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  }, [settings.themeId]);

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

  // Tally cells FLY lands for the player (one per landing) into a lifetime stat.
  const prevFlyIndex = useRef(0);
  useEffect(() => {
    const delta = game.flyIndex - prevFlyIndex.current;
    prevFlyIndex.current = game.flyIndex;
    if (delta <= 0) return;
    setStats((prev) => {
      const next: Stats = { ...prev, cellsFlown: (prev.cellsFlown ?? 0) + delta };
      saveStats(next);
      return next;
    });
  }, [game.flyIndex]);

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
      // Ask for a review after the 3rd win, exactly once.
      const totalWon = next.flight.won + next.daily.won;
      if (totalWon >= 3 && !hasBeenPromptedForReview()) {
        markReviewPrompted();
        setTimeout(() => setShowReviewPrompt(true), 2200);
      }

      if (game.dailyDate) {
        next.lastDailyCompleted = game.dailyDate;
        const yesterday = dateKey(new Date(Date.now() - 86400000));
        let streak: number;
        if (stats.lastDailyCompleted === game.dailyDate) streak = stats.dayStreak ?? 0;
        else if (stats.lastDailyCompleted === yesterday) streak = (stats.dayStreak ?? 0) + 1;
        else streak = 1;
        next.dayStreak = streak;
        next.bestDayStreak = Math.max(stats.bestDayStreak ?? 0, streak);
      }
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

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}

      {showReviewPrompt && (
        <ReviewPrompt onDone={() => setShowReviewPrompt(false)} />
      )}
    </div>
  );
}

export default App;
