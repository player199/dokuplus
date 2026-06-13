import React from 'react';
import { Difficulty, dateKey } from '../core/sudoku';
import { SavedGame, Stats } from '../core/storage';
import { formatTime } from '../core/format';

interface HomeScreenProps {
  saved: SavedGame | null;
  stats: Stats;
  generating: boolean;
  onContinue: () => void;
  onNewFlight: () => void;
  onDaily: () => void;
  onOpenSettings: () => void;
}

const PlaneLogo: React.FC = () => (
  <svg className="brand__plane" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
    />
  </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({
  saved,
  stats,
  generating,
  onContinue,
  onNewFlight,
  onDaily,
  onOpenSettings,
}) => {
  const today = new Date();
  const todayKey = dateKey(today);
  const dailyDone = stats.lastDailyCompleted === todayKey;

  const all = (['flight', 'daily'] as Difficulty[]).map((d) => stats[d]);
  const totalWon = all.reduce((sum, s) => sum + s.won, 0);
  const totalPlayed = all.reduce((sum, s) => sum + s.played, 0);
  const totalTime = all.reduce((sum, s) => sum + s.totalTime, 0);
  const winRate = totalPlayed ? Math.round((totalWon / totalPlayed) * 100) : 0;
  const avgTime = totalWon ? Math.round(totalTime / totalWon) : null;
  const bestTimes = all.map((s) => s.bestTime).filter((t): t is number => t !== null);
  const bestTime = bestTimes.length ? Math.min(...bestTimes) : null;
  const dayStreak = stats.dayStreak ?? 0;
  const bestDayStreak = stats.bestDayStreak ?? 0;
  const cellsFlown = stats.cellsFlown ?? 0;

  const filledCount = saved ? saved.values.filter((v) => v !== 0).length : 0;

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <div className="brand">
          <PlaneLogo />
          <h1>
            doku<span className="brand__plus">+</span>
          </h1>
        </div>
        <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.4 13a7.6 7.6 0 0 0 .06-1 7.6 7.6 0 0 0-.06-1l2.06-1.6a.5.5 0 0 0 .12-.63l-1.95-3.38a.5.5 0 0 0-.6-.22l-2.44.98a7.5 7.5 0 0 0-1.73-1l-.37-2.6a.5.5 0 0 0-.5-.42h-3.9a.5.5 0 0 0-.5.42l-.36 2.6c-.63.26-1.2.6-1.74 1l-2.43-.98a.5.5 0 0 0-.61.22L2.5 8.77a.5.5 0 0 0 .12.64L4.67 11a7.6 7.6 0 0 0 0 2l-2.05 1.6a.5.5 0 0 0-.12.63l1.95 3.38c.12.22.39.31.6.22l2.44-.98c.54.42 1.11.76 1.74 1.01l.36 2.6a.5.5 0 0 0 .5.42h3.9a.5.5 0 0 0 .5-.42l.37-2.6a7.5 7.5 0 0 0 1.73-1l2.44.97c.22.09.48 0 .6-.22l1.95-3.37a.5.5 0 0 0-.12-.64L19.4 13ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
            />
          </svg>
        </button>
      </header>

      <p className="home-tagline">
        Every board needs a real deduction before FLY can land the rest. No two are the same.
      </p>

      <button type="button" className="depart-btn" onClick={onNewFlight} disabled={generating}>
        <PlaneLogo />
        <span className="depart-btn__text">
          <strong>New Flight</strong>
          <small>Fresh board · tap to depart</small>
        </span>
        <span className="depart-btn__chev" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="m9 6 6 6-6 6-1.4-1.4L12.2 12 7.6 7.4 9 6Z" />
          </svg>
        </span>
      </button>

      <div className="home-cards">
        <button type="button" className="card card--daily" onClick={onDaily} disabled={generating}>
          <div className="card__row">
            <div>
              <span className="card__title">Daily Flight</span>
              <span className="card__sub">
                {today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                {dailyDone ? ' · Completed ✓' : ''}
              </span>
            </div>
            <svg viewBox="0 0 24 24" className="card__icon">
              <path
                fill="currentColor"
                d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10ZM5 8V6h14v2H5Z"
              />
            </svg>
          </div>
        </button>

        {saved && (
          <button
            type="button"
            className="card card--continue"
            onClick={onContinue}
            disabled={generating}
          >
            <div className="card__row">
              <div>
                <span className="card__title">Continue</span>
                <span className="card__sub">
                  {formatTime(saved.time)} · {filledCount}/81 placed
                </span>
              </div>
              <svg viewBox="0 0 24 24" className="card__icon">
                <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      <div className="home-section">
        <h2>Flight Log</h2>
        <div className="streak-hero">
          <PlaneLogo />
          <div className="streak-hero__main">
            <span className="streak-hero__value">{dayStreak}</span>
            <span className="streak-hero__label">Day streak</span>
          </div>
          <div className="streak-hero__meta">
            <span>Best {bestDayStreak}</span>
            <span>{cellsFlown.toLocaleString()} cells flown</span>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat__value">{totalWon}</span>
            <span className="stat__label">Landed</span>
          </div>
          <div className="stat">
            <span className="stat__value">{winRate}%</span>
            <span className="stat__label">Win rate</span>
          </div>
          <div className="stat">
            <span className="stat__value">{bestTime !== null ? formatTime(bestTime) : '—'}</span>
            <span className="stat__label">Best time</span>
          </div>
          <div className="stat">
            <span className="stat__value">{avgTime !== null ? formatTime(avgTime) : '—'}</span>
            <span className="stat__label">Avg time</span>
          </div>
        </div>
      </div>

      {generating && (
        <div className="overlay overlay--transparent">
          <div className="spinner" aria-label="Preparing puzzle" />
          <p className="generating-label">Charting your flight…</p>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
