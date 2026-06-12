import React from 'react';
import { boxOf, colOf, rowOf } from '../core/sudoku';

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
  onSelect: (i: number) => void;
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
  onSelect,
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

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={() => onSelect(i)}
      aria-label={`Row ${rowOf(i) + 1}, column ${colOf(i) + 1}${value ? `, ${value}` : ', empty'}`}
    >
      {value !== 0 ? (
        <span className="cell__value">{value}</span>
      ) : notesMask !== 0 ? (
        <span className="cell__notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
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
    </button>
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
  flyTarget: number | null;
  lastPlaced: number | null;
  paused: boolean;
  onSelect: (i: number) => void;
}

const Board: React.FC<BoardProps> = ({
  values,
  givens,
  notes,
  errors,
  selected,
  highlightSame,
  flying,
  flyTarget,
  lastPlaced,
  paused,
  onSelect,
}) => {
  const selectedValue = selected !== null ? values[selected] : 0;
  const selRow = selected !== null ? rowOf(selected) : -1;
  const selCol = selected !== null ? colOf(selected) : -1;
  const selBox = selected !== null ? boxOf(selected) : -1;

  const planeStyle: React.CSSProperties | undefined =
    flying && flyTarget !== null
      ? {
          left: `${(colOf(flyTarget) + 0.5) * (100 / 9)}%`,
          top: `${(rowOf(flyTarget) + 0.5) * (100 / 9)}%`,
        }
      : undefined;

  return (
    <div className={'board' + (flying ? ' board--flying' : '') + (paused ? ' board--paused' : '')}>
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
            onSelect={onSelect}
          />
        ))}
      </div>
      {flying && planeStyle && (
        <div className="board__plane" style={planeStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z"
            />
          </svg>
        </div>
      )}
      {paused && (
        <div className="board__pause-cover">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M8 5h3v14H8zm5 0h3v14h-3z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Board;
