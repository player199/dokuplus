import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './Board';
import Controls from './Controls';
import { GameActions, GameState, MISTAKE_LIMIT } from '../game/useGame';
import { DIFFICULTY_LABELS, digitCounts } from '../core/sudoku';
import { Settings } from '../core/storage';
import { formatTime } from '../core/format';

interface GameScreenProps {
  game: GameState;
  actions: GameActions;
  settings: Settings;
  canFly: boolean;
  noteEditable: boolean;
  isNewBest: boolean;
  onHome: () => void;
  onNewGame: () => void;
  onRetry: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  game,
  actions,
  settings,
  canFly,
  noteEditable,
  isNewBest,
  onHome,
  onNewGame,
  onRetry,
}) => {
  // Counts up each time FLY is pressed with nothing to land, so the button can
  // shake and explain itself instead of silently doing nothing.
  const [flyNudge, setFlyNudge] = useState(0);

  const handleFly = useCallback(() => {
    if (!game.flying && !canFly) {
      setFlyNudge((n) => n + 1);
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate([12, 40, 12]);
        } catch {
          // not supported
        }
      }
      return;
    }
    actions.toggleFly();
  }, [game.flying, canFly, actions, settings.hapticFeedback]);
  const givens = useMemo(() => game.puzzle.map((v) => v !== 0), [game.puzzle]);

  const errors = useMemo(() => {
    if (!settings.showErrors) return new Array(81).fill(false) as boolean[];
    return game.values.map((v, i) => v !== 0 && v !== game.solution[i]);
  }, [game.values, game.solution, settings.showErrors]);

  const counts = useMemo(() => digitCounts(game.values), [game.values]);

  // Light haptic tick on each placement.
  useEffect(() => {
    if (game.lastPlaced !== null && settings.hapticFeedback && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // not supported
      }
    }
  }, [game.lastPlaced, settings.hapticFeedback]);

  // Keyboard support for desktop players.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (game.status === 'won' || game.status === 'lost') return;
      if (/^[1-9]$/.test(e.key)) {
        actions.input(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        actions.erase();
      } else if (e.key === 'n' || e.key === 'N') {
        actions.toggleNotesMode();
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
        actions.undo();
      } else if (e.key === 'f' || e.key === 'F') {
        handleFly();
      } else if (e.key === 'Escape') {
        actions.select(null);
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const cur = game.selected ?? 0;
        let row = Math.floor(cur / 9);
        let col = cur % 9;
        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
        actions.select(row * 9 + col);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, game.selected, game.status, handleFly]);

  const difficultyLabel = DIFFICULTY_LABELS[game.difficulty];
  const finished = game.status === 'won' || game.status === 'lost';

  // Hold the win card back until the puzzle is solved AND any victory flight has
  // landed, with a short beat so the final cell is seen settling first.
  const [showWin, setShowWin] = useState(false);
  useEffect(() => {
    if (game.status === 'won' && !game.flying) {
      const t = setTimeout(() => setShowWin(true), 360);
      return () => clearTimeout(t);
    }
    setShowWin(false);
  }, [game.status, game.flying]);

  return (
    <div className="screen game-screen">
      <header className="game-header">
        <button type="button" className="icon-btn" onClick={onHome} aria-label="Back to home">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="m15 4-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6L15 4Z" />
          </svg>
        </button>
        <div className="game-header__info">
          <span className="game-header__difficulty">{difficultyLabel}</span>
          {settings.mistakeLimit && (
            <span className={'game-header__mistakes' + (game.mistakes > 0 ? ' is-warn' : '')}>
              Mistakes {game.mistakes}/{MISTAKE_LIMIT}
            </span>
          )}
        </div>
        <div className="game-header__right">
          <span className="game-header__time">{formatTime(game.time)}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={game.status === 'paused' ? actions.resumePlay : actions.pause}
            aria-label={game.status === 'paused' ? 'Resume' : 'Pause'}
            disabled={finished}
          >
            {game.status === 'paused' ? (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5h3v14H8V5Zm5 0h3v14h-3V5Z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="board-stage">
        <Board
          values={game.values}
        givens={givens}
        notes={game.notes}
        errors={errors}
        selected={game.selected}
        highlightSame={settings.highlightSame}
        flying={game.flying}
        flyRoute={game.flyRoute}
        lastPlaced={game.lastPlaced}
        paused={game.status === 'paused'}
        noteEditable={noteEditable}
        onSelect={(i) => {
          if (game.status === 'paused') {
            actions.resumePlay();
            return;
          }
          actions.select(i);
        }}
          onToggleNote={actions.toggleNote}
          onFlyLand={actions.flyLand}
          onFlyDone={actions.endFly}
        />
      </div>

      <Controls
        digitCounts={counts}
        notesMode={game.notesMode}
        autoActive={game.autoNotes}
        canUndo={game.history.length > 0}
        flying={game.flying}
        canFly={canFly}
        flyNudge={flyNudge}
        disabled={game.status !== 'playing' || game.flying}
        onDigit={actions.input}
        onErase={actions.erase}
        onUndo={actions.undo}
        onToggleNotes={actions.toggleNotesMode}
        onAutoNotes={actions.toggleAutoNotes}
        onHint={actions.hint}
        onFly={handleFly}
      />

      {game.status === 'paused' && (
        <div className="overlay" role="dialog" aria-label="Paused">
          <div className="overlay__card">
            <h2>Paused</h2>
            <p className="overlay__sub">
              {difficultyLabel} · {formatTime(game.time)}
            </p>
            <button type="button" className="btn btn--primary" onClick={actions.resumePlay}>
              Resume
            </button>
            <button type="button" className="btn btn--ghost" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      )}

      {showWin && (
        <div className="overlay" role="dialog" aria-label="Puzzle solved">
          <div className="overlay__card overlay__card--win">
            <div className="overlay__plane">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
                />
              </svg>
            </div>
            <h2>Smooth landing!</h2>
            {isNewBest && <div className="badge badge--best">New best time</div>}
            <div className="win-stats">
              <div>
                <span className="win-stats__value">{formatTime(game.time)}</span>
                <span className="win-stats__label">Time</span>
              </div>
              <div>
                <span className="win-stats__value">{difficultyLabel}</span>
                <span className="win-stats__label">Difficulty</span>
              </div>
              <div>
                <span className="win-stats__value">{game.mistakes}</span>
                <span className="win-stats__label">Mistakes</span>
              </div>
              <div>
                <span className="win-stats__value">{game.hintsUsed}</span>
                <span className="win-stats__label">Hints</span>
              </div>
            </div>
            <button type="button" className="btn btn--primary" onClick={onNewGame}>
              New Game
            </button>
            <button type="button" className="btn btn--ghost" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      )}

      {game.status === 'lost' && (
        <div className="overlay" role="dialog" aria-label="Game over">
          <div className="overlay__card">
            <h2>Turbulence!</h2>
            <p className="overlay__sub">You hit {MISTAKE_LIMIT} mistakes. Try this puzzle again?</p>
            <button type="button" className="btn btn--primary" onClick={onRetry}>
              Retry Puzzle
            </button>
            <button type="button" className="btn btn--ghost" onClick={onNewGame}>
              New Game
            </button>
            <button type="button" className="btn btn--ghost" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
