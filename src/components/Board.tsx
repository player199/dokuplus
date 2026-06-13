import React, { useEffect, useRef } from 'react';
import { boxOf, colOf, rowOf } from '../core/sudoku';
import { animateFlight } from '../game/flight';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface CellProps {
  i: number;
  value: number;
  isGiven: boolean;
  isError: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameDigit: boolean;
  isLanded: boolean;
  notesMask: number;
  highlightDigit: number;
  noteEditable: boolean; // desktop: tap a candidate inside the cell to toggle it
  onSelect: (i: number) => void;
  onToggleNote: (i: number, digit: number) => void;
}

const Cell = React.memo(function Cell({
  i,
  value,
  isGiven,
  isError,
  isSelected,
  isPeer,
  isSameDigit,
  isLanded,
  notesMask,
  highlightDigit,
  noteEditable,
  onSelect,
  onToggleNote,
}: CellProps) {
  const classes = ['cell'];
  if (isSelected) classes.push('cell--selected');
  else if (isSameDigit) classes.push('cell--same');
  else if (isPeer) classes.push('cell--peer');
  if (isGiven) classes.push('cell--given');
  if (isError) classes.push('cell--error');
  if (isLanded) classes.push('cell--landed');
  if (colOf(i) % 3 === 2 && colOf(i) !== 8) classes.push('cell--box-right');
  if (rowOf(i) % 3 === 2 && rowOf(i) !== 8) classes.push('cell--box-bottom');

  // The selected empty cell on desktop becomes a 3x3 grid of toggle targets.
  const editing = noteEditable && isSelected && !isGiven && value === 0;

  return (
    <div
      role="button"
      tabIndex={-1}
      className={classes.join(' ')}
      onClick={() => onSelect(i)}
      aria-label={`Row ${rowOf(i) + 1}, column ${colOf(i) + 1}${value ? `, ${value}` : ', empty'}`}
    >
      {value !== 0 ? (
        <span className="cell__value">{value}</span>
      ) : editing ? (
        <span className="cell__notes cell__notes--edit">
          {DIGITS.map((n) => {
            const on = (notesMask & (1 << (n - 1))) !== 0;
            return (
              <button
                key={n}
                type="button"
                className={'cell__note-btn' + (on ? ' is-on' : '')}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleNote(i, n);
                }}
                aria-label={`${on ? 'Remove' : 'Add'} candidate ${n}`}
              >
                {n}
              </button>
            );
          })}
        </span>
      ) : notesMask !== 0 ? (
        <span className="cell__notes">
          {DIGITS.map((n) => (
            <span
              key={n}
              className={
                'cell__note' +
                (notesMask & (1 << (n - 1)) ? ' cell__note--on' : '') +
                (highlightDigit === n && notesMask & (1 << (n - 1)) ? ' cell__note--hl' : '')
              }
            >
              {notesMask & (1 << (n - 1)) ? n : ''}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
});

interface BoardProps {
  values: number[];
  givens: boolean[];
  notes: number[];
  errors: boolean[];
  selected: number | null;
  highlightSame: boolean;
  flying: boolean;
  flyRoute: { i: number; digit: number }[];
  lastPlaced: number | null;
  paused: boolean;
  noteEditable: boolean;
  onSelect: (i: number) => void;
  onToggleNote: (i: number, digit: number) => void;
  onFlyLand: () => void;
  onFlyDone: () => void;
}

const Board: React.FC<BoardProps> = ({
  values,
  givens,
  notes,
  errors,
  selected,
  highlightSame,
  flying,
  flyRoute,
  lastPlaced,
  paused,
  noteEditable,
  onSelect,
  onToggleNote,
  onFlyLand,
  onFlyDone,
}) => {
  const selectedValue = selected !== null ? values[selected] : 0;
  const selRow = selected !== null ? rowOf(selected) : -1;
  const selCol = selected !== null ? colOf(selected) : -1;
  const selBox = selected !== null ? boxOf(selected) : -1;

  const boardRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  // Latest values read fresh when a flight starts, without re-running the effect.
  const routeRef = useRef(flyRoute);
  routeRef.current = flyRoute;
  const landRef = useRef(onFlyLand);
  landRef.current = onFlyLand;
  const doneRef = useRef(onFlyDone);
  doneRef.current = onFlyDone;

  // Run the flight controller for the duration of a single flight.
  useEffect(() => {
    if (!flying) return;
    const plane = planeRef.current;
    const board = boardRef.current;
    const route = routeRef.current;
    if (!plane || !board || route.length === 0) return;
    const rect = board.getBoundingClientRect();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return animateFlight({
      plane,
      craft: craftRef.current,
      width: rect.width,
      height: rect.height,
      centers: route.map(({ i }) => ({ x: (colOf(i) + 0.5) / 9, y: (rowOf(i) + 0.5) / 9 })),
      reducedMotion: reduced,
      onLand: () => landRef.current(),
      onDone: () => doneRef.current(),
    });
  }, [flying]);

  return (
    <div
      ref={boardRef}
      className={'board' + (flying ? ' board--flying' : '') + (paused ? ' board--paused' : '')}
    >
      <div className="board__grid">
        {values.map((value, i) => (
          <Cell
            key={i}
            i={i}
            value={paused ? 0 : value}
            isGiven={givens[i]}
            isError={!paused && errors[i]}
            isSelected={selected === i}
            isPeer={
              selected !== null &&
              selected !== i &&
              (rowOf(i) === selRow || colOf(i) === selCol || boxOf(i) === selBox)
            }
            isSameDigit={
              !paused &&
              highlightSame &&
              selectedValue !== 0 &&
              value === selectedValue &&
              selected !== i
            }
            isLanded={!paused && lastPlaced === i}
            notesMask={paused ? 0 : notes[i]}
            highlightDigit={highlightSame ? selectedValue : 0}
            noteEditable={!paused && noteEditable}
            onSelect={onSelect}
            onToggleNote={onToggleNote}
          />
        ))}
      </div>

      {/* HUD registration brackets — the signature flight-deck framing. */}
      <span className="board__bracket board__bracket--tl" aria-hidden="true" />
      <span className="board__bracket board__bracket--tr" aria-hidden="true" />
      <span className="board__bracket board__bracket--bl" aria-hidden="true" />
      <span className="board__bracket board__bracket--br" aria-hidden="true" />

      {flying && (
        <div className="board__plane" ref={planeRef} style={{ opacity: 0 }}>
          <div className="board__plane-craft" ref={craftRef}>
            <span className="board__contrail" aria-hidden="true" />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
              />
            </svg>
          </div>
        </div>
      )}
      {paused && (
        <div className="board__pause-cover">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M8 5h3v14H8zm5 0h3v14h-3z" />
          </svg>
          <span className="board__pause-label">Paused · tap to resume</span>
        </div>
      )}
    </div>
  );
};

export default Board;
