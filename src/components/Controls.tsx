import React, { useEffect, useState } from 'react';

interface ControlsProps {
  digitCounts: number[];
  notesMode: boolean;
  autoActive: boolean;
  canUndo: boolean;
  flying: boolean;
  canFly: boolean;
  flyNudge: number; // bumps each time FLY is pressed with nothing to land
  disabled: boolean;
  onDigit: (n: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onToggleNotes: () => void;
  onAutoNotes: () => void;
  onHint: () => void;
  onFly: () => void;
}

const ToolButton: React.FC<{
  label: string;
  active?: boolean;
  disabled?: boolean;
  extraClass?: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active, disabled, extraClass, onClick, children }) => (
  <button
    type="button"
    className={'tool' + (active ? ' tool--active' : '') + (extraClass ? ' ' + extraClass : '')}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
  >
    <span className="tool__icon">{children}</span>
    <span className="tool__label">{label}</span>
  </button>
);

const Controls: React.FC<ControlsProps> = ({
  digitCounts,
  notesMode,
  autoActive,
  canUndo,
  flying,
  canFly,
  flyNudge,
  disabled,
  onDigit,
  onErase,
  onUndo,
  onToggleNotes,
  onAutoNotes,
  onHint,
  onFly,
}) => {
  // Replay a short shake whenever FLY is pressed with nothing to land.
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!flyNudge) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 460);
    return () => clearTimeout(t);
  }, [flyNudge]);

  const flyClass =
    'fly-btn' +
    (flying ? ' fly-btn--active' : '') +
    (!flying && canFly ? ' fly-btn--armed' : '') +
    (!flying && !canFly ? ' fly-btn--idle' : '') +
    (shake ? ' fly-btn--nudge' : '');

  const flyCaption = flying
    ? 'tap to abort'
    : canFly
    ? 'cleared for takeoff'
    : 'pencil in candidates first';

  return (
    <div className="controls">
      <div className="controls__tools">
        <ToolButton label="Undo" onClick={onUndo} disabled={disabled || !canUndo}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62A8 8 0 0 1 20.05 16l2.36-.78A10.5 10.5 0 0 0 12.5 8Z"
            />
          </svg>
        </ToolButton>
        <ToolButton label="Erase" onClick={onErase} disabled={disabled} extraClass="tool--erase-desktop">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="m16.24 3.56 4.2 4.2a2 2 0 0 1 0 2.83l-9.6 9.6H21v2H7.03l-3.27-3.26a2 2 0 0 1 0-2.83L13.4 3.56a2 2 0 0 1 2.83 0ZM5.17 17.5l2.93 2.93 3.32-3.32-4.2-4.2-2.05 2.05a.5.5 0 0 0 0 .7Z"
            />
          </svg>
        </ToolButton>
        <ToolButton label="Notes" active={notesMode} onClick={onToggleNotes} disabled={disabled}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"
            />
          </svg>
        </ToolButton>
        <ToolButton label="Auto" active={autoActive} onClick={onAutoNotes} disabled={disabled}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Z"
            />
          </svg>
        </ToolButton>
        <ToolButton label="Hint" onClick={onHint} disabled={disabled}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Zm-2.5 18a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-.5h-5v.5Z"
            />
          </svg>
        </ToolButton>
      </div>

      <div className="controls__digits">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const remaining = 9 - digitCounts[n];
          return (
            <button
              key={n}
              type="button"
              className={'digit' + (notesMode ? ' digit--notes' : '')}
              onClick={() => onDigit(n)}
              disabled={disabled || remaining <= 0}
            >
              <span className="digit__num">{n}</span>
              <span className="digit__count">{remaining > 0 ? remaining : ''}</span>
            </button>
          );
        })}
        {/* Erase lives in the digit grid on mobile (2×5 layout), hidden on desktop */}
        <button
          type="button"
          className="digit digit--erase"
          onClick={onErase}
          disabled={disabled}
          aria-label="Erase"
        >
          <svg viewBox="0 0 24 24" className="digit__erase-icon">
            <path
              fill="currentColor"
              d="m16.24 3.56 4.2 4.2a2 2 0 0 1 0 2.83l-9.6 9.6H21v2H7.03l-3.27-3.26a2 2 0 0 1 0-2.83L13.4 3.56a2 2 0 0 1 2.83 0ZM5.17 17.5l2.93 2.93 3.32-3.32-4.2-4.2-2.05 2.05a.5.5 0 0 0 0 .7Z"
            />
          </svg>
        </button>
      </div>

      <button type="button" className={flyClass} onClick={onFly} aria-pressed={flying}>
        <span className="fly-btn__wash" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
          />
        </svg>
        <span className="fly-btn__text">
          <strong>{flying ? 'LANDING' : 'FLY'}</strong>
          <small>{flyCaption}</small>
        </span>
      </button>
    </div>
  );
};

export default Controls;
